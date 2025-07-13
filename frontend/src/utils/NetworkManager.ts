import * as Network from 'expo-network';
import { AppState, AppStateStatus, type NativeEventSubscription } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { discoverServer, checkServerReachable } from './networkDiscovery';
import { dynamicConfig } from '../config/dynamicConfig';

type Subscriber = (url: string | null) => void;

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

class NetworkManagerImpl {
  // Singleton instance
  private static instance: NetworkManagerImpl | null = null;
  
  // Instance properties
  private baseUrl: string | null = null;
  private subscribers: Subscriber[] = [];
  private isInitialized = false;
  private discoveryInProgress = false;
  private lastDiscoveryTime = 0;
  private isConnected = false;
  private discoveryTimeout: NodeJS.Timeout | null = null;
  private networkStateSubscription: { remove: () => void } | null = null;
  private appStateSubscription: NativeEventSubscription | null = null;
  private readonly DISCOVERY_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  // Private constructor to prevent direct instantiation
  private constructor() {}
  
  /**
   * Get the singleton instance of NetworkManagerImpl
   */
  public static getInstance(): NetworkManagerImpl {
    if (!NetworkManagerImpl.instance) {
      NetworkManagerImpl.instance = new NetworkManagerImpl();
    }
    return NetworkManagerImpl.instance;
  }
  
  // Public methods
  public async getBaseUrl(): Promise<string | null> {
    // Dynamic discovery approach - no hardcoded IPs
    
    // Step 1: Try previously discovered/cached URL first
    if (this.baseUrl) {
      console.log('[NetworkManager] Step 1: Testing cached URL:', this.baseUrl);
      try {
        const isReachable = await checkServerReachable(this.baseUrl);
        if (isReachable) {
          console.log('[NetworkManager] Step 1 SUCCESS: Cached URL is reachable');
          return this.baseUrl;
        } else {
          console.log('[NetworkManager] Step 1 FAILED: Cached URL is not reachable');
          this.baseUrl = null; // Clear invalid cached URL
        }
      } catch (error) {
        console.error('[NetworkManager] Step 1 ERROR: Failed to check cached URL:', error);
        this.baseUrl = null; // Clear invalid cached URL
      }
    }
    
    // Step 2: Try localhost for development
    if (__DEV__) {
      console.log('[NetworkManager] Step 2: Testing localhost for development...');
      try {
        const localhostUrl = 'http://localhost:8000';
        const isReachable = await checkServerReachable(localhostUrl);
        if (isReachable) {
          console.log('[NetworkManager] Step 2 SUCCESS: Localhost is reachable');
          this.baseUrl = localhostUrl;
          await SecureStore.setItemAsync('last_known_server_url', localhostUrl);
          return localhostUrl;
        } else {
          console.log('[NetworkManager] Step 2 FAILED: Localhost is not reachable');
        }
      } catch (error) {
        console.warn('[NetworkManager] Step 2 ERROR: Localhost check failed:', error);
      }
    }
    
    // Step 3: Perform network discovery
    console.log('[NetworkManager] Step 3: Performing network discovery...');
    try {
      await this.performDiscovery(true);
      if (this.baseUrl) {
        console.log('[NetworkManager] Step 3 SUCCESS: Network discovery successful, using:', this.baseUrl);
        return this.baseUrl;
      } else {
        console.log('[NetworkManager] Step 3 FAILED: No server discovered on network');
      }
    } catch (error) {
      console.warn('[NetworkManager] Step 3 ERROR: Network discovery failed:', error);
    }
    
    // Step 4: Try common local network IPs as last resort
    console.log('[NetworkManager] Step 4: Trying common local network IPs...');
    const commonIPs = [
      'http://192.168.1.100:8000',
      'http://192.168.1.101:8000',
      'http://192.168.0.100:8000',
      'http://192.168.0.101:8000',
      'http://10.0.0.100:8000',
      'http://10.0.0.101:8000',
    ];
    
    for (const ip of commonIPs) {
      try {
        const isReachable = await checkServerReachable(ip);
        if (isReachable) {
          console.log('[NetworkManager] Step 4 SUCCESS: Found server at common IP:', ip);
          this.baseUrl = ip;
          await SecureStore.setItemAsync('last_known_server_url', ip);
          return ip;
        }
      } catch (error) {
        // Continue to next IP
        continue;
      }
    }
    
    console.log('[NetworkManager] ALL STEPS FAILED: No server found');
    return null;
  }

  public async refresh(): Promise<void> {
    console.log('[NetworkManager] Refreshing with dynamic discovery...');
    
    // Clear current base URL to force fresh discovery
    this.baseUrl = null;
    
    // Try to get a new base URL using the dynamic approach
    const newBaseUrl = await this.getBaseUrl();
    
    if (newBaseUrl) {
      console.log('[NetworkManager] Refresh SUCCESS: Found new server URL:', newBaseUrl);
      this.notifySubscribers();
    } else {
      console.log('[NetworkManager] Refresh FAILED: No server found');
    }
  }

  public subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    // Immediately notify new subscriber with current URL
    callback(this.baseUrl);
    
    // Return unsubscribe function
    return () => this.unsubscribe(callback);
  }

  public unsubscribe(callback: Subscriber): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  public isNetworkConnected(): boolean {
    return this.isConnected;
  }

  public async ensureConnection(): Promise<boolean> {
    if (!this.baseUrl) {
      return false;
    }
    return checkServerReachable(this.baseUrl);
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('[NetworkManager] Initializing with dynamic discovery...');
      
      // Initialize dynamic configuration first
      await dynamicConfig.initialize();
      
      // Set up network listeners
      await this.setupNetworkListeners();
      
      // Try to get base URL using dynamic discovery
      const baseUrl = await this.getBaseUrl();
      if (baseUrl) {
        console.log('[NetworkManager] Initialization SUCCESS: Found server at:', baseUrl);
        // Update dynamic config with discovered URL
        await dynamicConfig.setApiUrl(`${baseUrl}/api`);
      } else {
        console.log('[NetworkManager] Initialization: No server found initially, will retry on network changes');
      }
      
      this.isInitialized = true;
      console.log('[NetworkManager] Initialization complete');
    } catch (error) {
      console.error('[Network] Initialization error:', error);
      throw error;
    }
  }

  public cleanup(): void {
    // Clean up subscriptions
    if (this.networkStateSubscription) {
      this.networkStateSubscription.remove();
      this.networkStateSubscription = null;
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    // Clear any pending timeouts
    if (this.discoveryTimeout) {
      clearTimeout(this.discoveryTimeout);
      this.discoveryTimeout = null;
    }
    
    this.isInitialized = false;
  }

  public setManualServerUrl(url: string): void {
    console.log(`[Network] Manually setting server URL to: ${url}`);
    this.baseUrl = url;
    SecureStore.setItemAsync('last_known_server_url', url);
    this.notifySubscribers();
  }

  // Private methods
  private async performDiscovery(force = false): Promise<void> {
    if (this.discoveryInProgress) return;
    
    const now = Date.now();
    if (!force && now - this.lastDiscoveryTime < this.DISCOVERY_INTERVAL) {
      return; // Too soon for another discovery
    }
    
    this.discoveryInProgress = true;
    this.lastDiscoveryTime = now;
    
    try {
      const result = await discoverServer(force);
      if (result) {
        await this.setBaseUrl(result);
      }
    } catch (error) {
      console.error('[Network] Discovery error:', error);
    } finally {
      this.discoveryInProgress = false;
    }
  }
  
  private async setBaseUrl(url: string): Promise<void> {
    if (!url) return;
    
    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `http://${normalizedUrl}`;
    }
    
    // Remove trailing slashes
    normalizedUrl = normalizedUrl.replace(/\/+$/, '');
    
    // Update base URL
    if (this.baseUrl !== normalizedUrl) {
      this.baseUrl = normalizedUrl;
      await SecureStore.setItemAsync('last_known_server_url', normalizedUrl);
      this.notifySubscribers();
    }
  }
  
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.baseUrl);
      } catch (error) {
        console.error('[Network] Error notifying subscriber:', error);
      }
    }
  }
  
  private async setupNetworkListeners(): Promise<void> {
    // Network state listener
    this.networkStateSubscription = Network.addNetworkStateListener(async (state) => {
      const newNetworkState: NetworkState = {
        isConnected: !!state.isConnected,
        isInternetReachable: !!state.isInternetReachable,
        type: state.type || 'unknown',
        isWifi: state.type === Network.NetworkStateType.WIFI,
        isCellular: state.type === Network.NetworkStateType.CELLULAR
      };
      
      const wasConnected = this.isConnected;
      this.isConnected = !!state.isConnected && !!state.isInternetReachable;
      
      if (this.isConnected && !wasConnected) {
        // Network came back online
        await this.performDiscovery();
      }
      
      this.notifySubscribers();
    });
    
    // Initial network state
    const initialState = await Network.getNetworkStateAsync();
    this.isConnected = !!initialState.isConnected && !!initialState.isInternetReachable;
    
    // App state listener
    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        await this.performDiscovery();
      }
    });
  }
}

// Create and export the singleton instance
const NetworkManager = NetworkManagerImpl.getInstance();

export default NetworkManager;

// Export the class for type information
export { NetworkManagerImpl };

// Helper function to initialize the network manager
// Type for the NetworkManager instance
type NetworkManagerType = NetworkManagerImpl;

export const initializeNetworkManager = async (): Promise<NetworkManagerType> => {
  const networkManager = NetworkManager;
  await networkManager.initialize();
  return networkManager;
};

// Helper function to clean up the network manager
export const cleanupNetworkManager = (): void => {
  const networkManager = NetworkManager;
  networkManager.cleanup();
};
