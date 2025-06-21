import { Platform } from 'react-native';
import * as ExpoNetwork from 'expo-network';

import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean;
  type?: string;
};

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private currentNetworkState: NetworkState | null = {
    isConnected: false,
    isInternetReachable: false,
  };
  private subscribers: ((state: NetworkState) => void)[] = [];
  private isMonitoring = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastNetworkCheck = 0;
  private readonly CHECK_INTERVAL = 10000; // 10 seconds
  private readonly CACHE_DURATION = 300000; // 5 minutes

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  public async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Initial state check
    await this.checkNetworkState();
    
    // Set up interval for periodic checks
    this.checkInterval = setInterval(() => {
      this.checkNetworkState();
    }, this.CHECK_INTERVAL);
    
    // Listen to network state changes
    if (Platform.OS !== 'web') {
      ExpoNetwork.addNetworkStateListener(expoState => {
      const state: NetworkState = {
        isConnected: expoState.isConnected || false,
        isInternetReachable: expoState.isInternetReachable || false,
        type: expoState.type
      };
        this.handleNetworkStateChange(state);
      });
    }
  }

  public stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
  }

  public subscribe(callback: (state: NetworkState) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately notify with current state if available
    if (this.currentNetworkState) {
      callback(this.currentNetworkState);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  public getCurrentState(): NetworkState | null {
    return this.currentNetworkState ? { ...this.currentNetworkState } : null;
  }

  public isConnected(): boolean {
    return this.currentNetworkState?.isConnected === true;
  }

  public isInternetReachable(): boolean {
    return this.currentNetworkState?.isInternetReachable === true;
  }

  private async checkNetworkState() {
    const now = Date.now();
    
    // Throttle network checks to at most once per second
    if (now - this.lastNetworkCheck < 1000) {
      return;
    }
    
    try {
      const expoState = await ExpoNetwork.getNetworkStateAsync();
      const state: NetworkState = {
        isConnected: expoState.isConnected || false,
        isInternetReachable: expoState.isInternetReachable || false,
        type: expoState.type
      };
      this.lastNetworkCheck = now;
      this.handleNetworkStateChange(state);
    } catch (error) {
      console.error('Error checking network status:', error);
    }
  }

  private handleNetworkStateChange = (state: NetworkState) => {
    console.log('[NetworkMonitor] Network state changed:', state);
    
    // Skip if no meaningful change
    if (this.currentNetworkState && 
        this.currentNetworkState.isConnected === state.isConnected &&
        this.currentNetworkState.isInternetReachable === state.isInternetReachable &&
        this.currentNetworkState.type === state.type) {
      return;
    }
    
    this.currentNetworkState = { ...state };
    this.notifySubscribers(this.currentNetworkState);
    
    // Handle network state changes
    if (state.isConnected && state.isInternetReachable) {
      this.lastNetworkCheck = 0; // Force network check on next interval
    }
  }

  private notifySubscribers(state: NetworkState) {
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('[NetworkMonitor] Error in subscriber callback:', error);
      }
    });
  }

  private async handleNetworkChange(state: Network.NetworkState) {
    if (state.isConnected && state.isInternetReachable) {
      // Network is available, we can try to discover servers
      console.log('[NetworkMonitor] Network is available, checking servers...');
      
      // Here you could trigger server discovery or other network-dependent operations
      // For example:
      // await this.discoverServers();
    } else {
      console.warn('[NetworkMonitor] Network is not available');
      
      // Show offline warning if needed
      if (state.isConnected && !state.isInternetReachable) {
        Alert.alert(
          'No Internet Connection',
          'You are connected to a network but have no internet access.',
          [{ text: 'OK' }]
        );
      }
    }
  }
}

const networkMonitor = NetworkMonitor.getInstance();

export { networkMonitor, NetworkState };
export default networkMonitor;
