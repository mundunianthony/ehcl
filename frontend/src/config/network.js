/**
 * Network configuration for the app
 * This file contains settings for different environments and network conditions
 */

import { Platform } from 'react-native';
import * as Network from 'expo-network';

// Default configuration
const config = {
  // API settings
  api: {
    // Base timeout for API requests (in milliseconds)
    timeout: 30000, // 30 seconds
    
    // Maximum number of retries for failed requests
    maxRetries: 3,
    
    // Retry delay in milliseconds
    retryDelay: 1000,
  },
  
  // WebSocket settings (if used)
  websocket: {
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 5,
  },
  
  // Offline settings
  offline: {
    // How often to check for connection status (in milliseconds)
    checkInterval: 10000, // 10 seconds
    
    // How long to cache API responses (in milliseconds)
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
  },
};

// Development environment overrides
const development = {
  ...config,
  api: {
    ...config.api,
    // Shorter timeouts for development
    timeout: 15000, // 15 seconds
  },
};

// Production environment overrides
const production = {
  ...config,
  api: {
    ...config.api,
    // Longer timeouts for production
    timeout: 60000, // 60 seconds
  },
};

// Get the appropriate config based on environment
const getConfig = () => {
  if (__DEV__) {
    return development;
  }
  return production;
};

// Helper function to get the current network status
const getNetworkStatus = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return {
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type,
    };
  } catch (error) {
    console.error('Error getting network status:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
      error: error.message,
    };
  }
};

export default {
  ...getConfig(),
  getNetworkStatus,
  // Export constants for direct access
  API_TIMEOUT: getConfig().api.timeout,
  MAX_RETRIES: getConfig().api.maxRetries,
  RETRY_DELAY: getConfig().api.retryDelay,
};
