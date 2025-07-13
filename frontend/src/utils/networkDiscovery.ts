import { Platform, NativeModules } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';

// Default server port
const DEFAULT_PORT = 8000;

// Common server paths to check
const SERVER_PATHS = ['/api/', '/health/', '/'];

// Timeout for server checks (in ms)
const CHECK_TIMEOUT = 2000; // Reduced timeout for faster discovery

interface NetworkInfo {
  ipAddress: string | null;
  isConnected: boolean;
  ssid?: string;
  bssid?: string;
  networkType?: string;
}

interface ComputerIPInfo {
  computerIP: string | null;
  deviceIP: string | null;
  networkRange: string | null;
}

/**
 * Get the current network information including IP address
 */
const getNetworkInfo = async (): Promise<NetworkInfo> => {
  try {
    console.log('[NetworkDiscovery] Getting network info...');

    // Get network state first
    const networkState = await Network.getNetworkStateAsync();
    console.log('[NetworkDiscovery] Network state:', networkState);

    // For Android
    if (Platform.OS === 'android') {
      const { getCurrentNetworkInfo } = NativeModules.RNNetworkInfo || {};

      if (getCurrentNetworkInfo) {
        // If we have the native module, use it
        try {
          const nativeInfo = await getCurrentNetworkInfo();
          console.log('[NetworkDiscovery] Native network info:', nativeInfo);
          return {
            ipAddress: nativeInfo.ipAddress,
            isConnected: !!networkState.isConnected,
            ssid: nativeInfo.ssid,
            bssid: nativeInfo.bssid,
            networkType: networkState.type
          };
        } catch (error) {
          console.warn('[NetworkDiscovery] Native module failed, using fallback:', error);
        }
      }

      // Fallback for when native module is not available
      return await getNetworkInfoFallback(networkState);
    }

    // For iOS, we'll use the fallback for now
    return await getNetworkInfoFallback(networkState);
  } catch (error) {
    console.error('[NetworkDiscovery] Error getting network info:', error);
    return {
      ipAddress: null,
      isConnected: false,
    };
  }
};

/**
 * Enhanced fallback method to get network info using multiple approaches
 */
const getNetworkInfoFallback = async (networkState: any): Promise<NetworkInfo> => {
  console.log('[NetworkDiscovery] Using fallback network info method...');

  // Try multiple methods to get IP address
  const ipAddress = await getIPAddressWithMultipleMethods();

  return {
    ipAddress,
    isConnected: networkState.isConnected,
    networkType: networkState.type
  };
};

/**
 * Try multiple methods to get IP address
 */
const getIPAddressWithMultipleMethods = async (): Promise<string | null> => {
  // Method 1: Try using Network.getIpAddressAsync() if available
  try {
    if (Network.getIpAddressAsync) {
      const networkIP = await Network.getIpAddressAsync();
      if (networkIP) {
        console.log('[NetworkDiscovery] Got IP from Network API:', networkIP);
        return networkIP;
      }
    }
  } catch (error) {
    console.warn('[NetworkDiscovery] Network API method failed:', error);
  }

  // Method 2: Try localhost first (for development)
  try {
    const isLocalhostReachable = await checkServerReachable('http://localhost:8000');
    if (isLocalhostReachable) {
      console.log('[NetworkDiscovery] Localhost is reachable, using 127.0.0.1');
      return '127.0.0.1';
    }
  } catch (error) {
    console.warn('[NetworkDiscovery] Localhost check failed:', error);
  }

  // Method 3: Try WebSocket approach
  try {
    const wsIP = await getIPFromWebSocket();
    if (wsIP) {
      console.log('[NetworkDiscovery] Got IP from WebSocket:', wsIP);
      return wsIP;
    }
  } catch (error) {
    console.warn('[NetworkDiscovery] WebSocket method failed:', error);
  }

  // Method 4: Try fetch approach
  try {
    const fetchIP = await getIPFromFetch();
    if (fetchIP) {
      console.log('[NetworkDiscovery] Got IP from fetch:', fetchIP);
      return fetchIP;
    }
  } catch (error) {
    console.warn('[NetworkDiscovery] Fetch method failed:', error);
  }

  console.warn('[NetworkDiscovery] All IP detection methods failed');
  return null;
};

/**
 * Get IP address using WebSocket connection
 */
const getIPFromWebSocket = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      // Try to connect to a local server to get local IP
      const socket = new WebSocket('ws://localhost:8000/ws/');

      socket.onopen = () => {
        try {
          // @ts-ignore - _url is not in the TypeScript type but exists at runtime
          const socketUrl = socket._url || '';
          const ipMatch = socketUrl.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
          const ipAddress = ipMatch ? ipMatch[1] : null;

          socket.close();
          resolve(ipAddress);
        } catch (error) {
          socket.close();
          resolve(null);
        }
      };

      socket.onerror = () => {
        socket.close();
        resolve(null);
      };

      // Set a timeout
      setTimeout(() => {
        socket.close();
        resolve(null);
      }, 2000);
    } catch (error) {
      resolve(null);
    }
  });
};

/**
 * Get IP address using fetch request
 */
const getIPFromFetch = async (): Promise<string | null> => {
  try {
    // Try to fetch from a local endpoint to get local IP
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch('http://localhost:8000/health/', {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    // If we can reach localhost, we're likely on the same machine
    // Return a common local IP pattern
    return '127.0.0.1';
  } catch (error) {
    return null;
  }
};

/**
 * Detect computer IP address on the same network
 */
const detectComputerIP = async (deviceIP: string): Promise<ComputerIPInfo> => {
  console.log('[NetworkDiscovery] Detecting computer IP for device IP:', deviceIP);

  if (!deviceIP) {
    console.warn('[NetworkDiscovery] No device IP available for computer detection');
    return { computerIP: null, deviceIP: null, networkRange: null };
  }

  // Extract network range from device IP (e.g., 192.168.1.x from 192.168.1.100)
  const ipParts = deviceIP.split('.');
  if (ipParts.length !== 4) {
    console.warn('[NetworkDiscovery] Invalid device IP format:', deviceIP);
    return { computerIP: null, deviceIP, networkRange: null };
  }

  const networkRange = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
  console.log('[NetworkDiscovery] Network range:', networkRange);

  // Common computer IP patterns to check
  const computerIPCandidates = [
    `${networkRange}.1`,    // Router/Gateway
    `${networkRange}.2`,    // Common computer IP
    `${networkRange}.10`,   // Common computer IP
    `${networkRange}.20`,   // Common computer IP
    `${networkRange}.50`,   // Common computer IP
    `${networkRange}.100`,  // Common computer IP
    `${networkRange}.200`,  // Common computer IP
    `${networkRange}.254`,  // Router/Gateway
  ];

  // Remove device IP from candidates to avoid checking itself
  const filteredCandidates = computerIPCandidates.filter(ip => ip !== deviceIP);

  console.log('[NetworkDiscovery] Checking computer IP candidates:', filteredCandidates);

  // Check each candidate for Django server
  for (const candidateIP of filteredCandidates) {
    try {
      const isReachable = await checkServerReachable(`http://${candidateIP}:${DEFAULT_PORT}`);
      if (isReachable) {
        console.log('[NetworkDiscovery] Found computer with Django server at:', candidateIP);
        return {
          computerIP: candidateIP,
          deviceIP,
          networkRange
        };
      }
    } catch (error) {
      // Continue checking other candidates
      continue;
    }
  }

  // If no specific computer found, try a broader scan
  console.log('[NetworkDiscovery] No specific computer found, trying broader scan...');
  const broaderScanResult = await scanNetworkRange(networkRange, deviceIP);

  return {
    computerIP: broaderScanResult,
    deviceIP,
    networkRange
  };
};

/**
 * Scan a network range for Django servers
 */
const scanNetworkRange = async (networkRange: string, excludeIP: string): Promise<string | null> => {
  console.log('[NetworkDiscovery] Scanning network range:', networkRange);

  // Create a list of IPs to scan (excluding the device IP)
  const ipsToScan: string[] = [];
  for (let i = 1; i <= 254; i++) {
    const ip = `${networkRange}.${i}`;
    if (ip !== excludeIP) {
      ipsToScan.push(ip);
    }
  }

  // Scan in batches to avoid overwhelming the network
  const batchSize = 5; // Reduced for faster scanning
  const batches = [];
  for (let i = 0; i < ipsToScan.length; i += batchSize) {
    batches.push(ipsToScan.slice(i, i + batchSize));
  }

  console.log('[NetworkDiscovery] Scanning', ipsToScan.length, 'IPs in', batches.length, 'batches');

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`[NetworkDiscovery] Scanning batch ${batchIndex + 1}/${batches.length}:`, batch);

    // Check all IPs in the current batch concurrently
    const promises = batch.map(async (ip) => {
      try {
        const isReachable = await checkServerReachable(`http://${ip}:${DEFAULT_PORT}`);
        return isReachable ? ip : null;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    const foundIP = results.find(result => result !== null);

    if (foundIP) {
      console.log('[NetworkDiscovery] Found Django server at:', foundIP);
      return foundIP;
    }
  }

  console.log('[NetworkDiscovery] No Django server found in network range');
  return null;
};

/**
 * Enhanced server discovery with automatic computer IP detection
 */
export const discoverServer = async (forceRediscover = false): Promise<string | null> => {
  if (!__DEV__) {
    // In production, always use the deployed backend
    return 'https://web-production-52fc7.up.railway.app';
  }
  try {
    console.log('[NetworkDiscovery] Starting enhanced server discovery...');

    // Quick localhost check first (fastest)
    if (__DEV__) {
      console.log('[NetworkDiscovery] Quick localhost check...');
      try {
        const localhostUrl = 'http://localhost:8000';
        const isReachable = await checkServerReachable(localhostUrl);
        if (isReachable) {
          console.log('[NetworkDiscovery] Localhost is reachable');
          await SecureStore.setItemAsync('last_known_server_url', localhostUrl);
          return localhostUrl;
        }
      } catch (error) {
        console.warn('[NetworkDiscovery] Localhost check failed:', error);
      }
    }

    // Check if we have a cached result and force rediscover is not requested
    if (!forceRediscover) {
      const cachedUrl = await SecureStore.getItemAsync('last_known_server_url');
      if (cachedUrl) {
        console.log('[NetworkDiscovery] Testing last known URL:', cachedUrl);
        const isReachable = await checkServerReachable(cachedUrl);
        if (isReachable) {
          console.log('[NetworkDiscovery] Last known URL is still reachable');
          return cachedUrl;
        }
        console.log('[NetworkDiscovery] Last known URL is not reachable');
      }
    }

    // Get network information
    const networkInfo = await getNetworkInfo();
    if (!networkInfo.isConnected) {
      console.warn('[NetworkDiscovery] Device is not connected to network');
      return null;
    }

    if (!networkInfo.ipAddress) {
      console.warn('[NetworkDiscovery] Could not determine device IP address');
      return null;
    }

    console.log('[NetworkDiscovery] Device IP address:', networkInfo.ipAddress);

    // Method 1: Detect computer IP on the same network
    const computerInfo = await detectComputerIP(networkInfo.ipAddress);

    if (computerInfo.computerIP) {
      const serverUrl = `http://${computerInfo.computerIP}:${DEFAULT_PORT}`;
      console.log('[NetworkDiscovery] Method 1 SUCCESS: Found Django server at:', serverUrl);

      // Cache the result
      await SecureStore.setItemAsync('last_known_server_url', serverUrl);
      return serverUrl;
    }

    // Method 2: Try common network ranges
    console.log('[NetworkDiscovery] Method 2: Trying common network ranges...');
    const commonRanges = [
      '192.168.1',
      '192.168.0',
      '192.168.2',
      '10.0.0',
      '10.0.1',
      '172.16.0',
      '172.16.1',
    ];

    for (const range of commonRanges) {
      try {
        const foundIP = await scanNetworkRange(range, networkInfo.ipAddress);
        if (foundIP) {
          const serverUrl = `http://${foundIP}:${DEFAULT_PORT}`;
          console.log('[NetworkDiscovery] Method 2 SUCCESS: Found server in common range:', serverUrl);
          await SecureStore.setItemAsync('last_known_server_url', serverUrl);
          return serverUrl;
        }
      } catch (error) {
        console.warn(`[NetworkDiscovery] Method 2: Failed to scan range ${range}:`, error);
        continue;
      }
    }

    // Method 3: Try specific common IPs (reduced list for faster discovery)
    console.log('[NetworkDiscovery] Method 3: Trying specific common IPs...');
    const commonIPs = [
      '192.168.1.100', '192.168.1.101',
      '192.168.0.100', '192.168.0.101',
      '10.0.0.100', '10.0.0.101',
    ];

    for (const ip of commonIPs) {
      try {
        const isReachable = await checkServerReachable(`http://${ip}:${DEFAULT_PORT}`);
        if (isReachable) {
          const serverUrl = `http://${ip}:${DEFAULT_PORT}`;
          console.log('[NetworkDiscovery] Method 3 SUCCESS: Found server at common IP:', serverUrl);
          await SecureStore.setItemAsync('last_known_server_url', serverUrl);
          return serverUrl;
        }
      } catch (error) {
        continue;
      }
    }

    console.log('[NetworkDiscovery] All methods failed: No Django server found');
    return null;

  } catch (error) {
    console.error('[NetworkDiscovery] Error during server discovery:', error);
    return null;
  }
};

/**
 * Enhanced server reachability check with multiple endpoints
 */
export const checkServerReachable = async (baseUrl: string, timeout: number = CHECK_TIMEOUT): Promise<boolean> => {
  // Ensure the URL has the correct format
  const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  console.log(`[NetworkDiscovery] Checking server reachability: ${url}`);

  // Try multiple endpoints to confirm it's our server
  const endpoints = ['/health/', '/api/', '/'];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${url}${endpoint}`, {
        signal: controller.signal,
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      // If we get any response, the server is reachable
      if (response.status < 500) {
        console.log(`[NetworkDiscovery] Server found at ${url} (${response.status} ${response.statusText})`);
        return true;
      }
    } catch (error) {
      // Continue to next endpoint on error
      continue;
    }
  }

  return false;
};

// Export helper functions for testing
export { getNetworkInfo, getIPAddressWithMultipleMethods };

export default discoverServer;
