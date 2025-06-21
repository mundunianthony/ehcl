import * as Network from 'expo-network';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { getApiUrl } from '../config/api'; // Import the dynamic API URL

interface NetworkStatus {
  isConnected: boolean;
  type?: Network.NetworkStateType;
  ipAddress?: string;
  isInternetReachable?: boolean | null;
  error?: string;
}

interface ApiResult {
  success: boolean;
  status?: number;
  responseTime?: string;
  data?: any;
  error?: string;
}

export const checkNetworkStatus = async (showAlerts = true): Promise<NetworkStatus> => {
  try {
    // Check internet reachability
    const networkState = await Network.getNetworkStateAsync();
    
    if (!networkState.isConnected) {
      const errorMsg = 'No internet connection';
      if (showAlerts) {
        Alert.alert('No Internet', 'Please check your internet connection');
      }
      return { 
        isConnected: false, 
        type: networkState.type,
        error: errorMsg,
        isInternetReachable: networkState.isInternetReachable
      };
    }

    // Get network information
    const ipAddress = await Network.getIpAddressAsync();
    const networkInfo: NetworkStatus = {
      isConnected: true,
      type: networkState.type,
      ipAddress,
      isInternetReachable: networkState.isInternetReachable,
    };
    
    console.log('Network Info:', networkInfo);
    return networkInfo;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Network check failed:', errorMessage);
    if (showAlerts) {
      Alert.alert('Network Error', 'Failed to check network status');
    }
    return { 
      isConnected: false, 
      error: errorMessage,
      type: undefined,
      ipAddress: undefined,
      isInternetReachable: undefined
    };
  }
};

export const testApiConnection = async (showAlerts = true): Promise<ApiResult> => {
  const startTime = Date.now();
  try {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      throw new Error('API URL not set. Cannot test connection.');
    }
    const testUrl = `${apiUrl}/users/`;
    console.log(`[Network] Testing API connection to: ${testUrl}`);
    
    // First check network connectivity
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      throw new Error('No network connection detected');
    }
    
    console.log('[Network] Network state:', {
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type
    });
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    console.log(`[Network] Response status: ${response.status} (${response.statusText})`);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('[Network] Could not parse response as JSON');
      data = await response.text();
    }
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = data;
      throw error;
    }
    
    const result = {
      success: true,
      status: response.status,
      responseTime: `${responseTime}ms`,
      data,
    };
    
    console.log('[Network] API Connection successful:', JSON.stringify(result, null, 2));
    return result;
  } catch (error: unknown) {
    const responseTime = error instanceof Error && 'status' in error && typeof (error as any).status === 'number' 
      ? Date.now() - startTime 
      : 0;
    let errorMessage = 'Unknown error';
    let errorStatus: number | undefined;
    let responseData: any = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle fetch errors
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (error.message === 'Network request failed') {
        errorMessage = 'Network request failed. Please check your internet connection.';
      }
      
      // Check for response data in error
      if ('response' in error) {
        responseData = (error as any).response;
      }
      
      // Get status if available
      if ('status' in error && typeof (error as any).status === 'number') {
        errorStatus = (error as any).status;
      }
    }
    
    const errorResult = {
      success: false,
      status: errorStatus,
      responseTime: `${responseTime}ms`,
      error: errorMessage,
      data: responseData,
    };
    
    console.error('[Network] API Connection failed:', JSON.stringify(errorResult, null, 2));
    
    if (showAlerts) {
      Alert.alert(
        'Connection Error',
        errorMessage || 'Could not connect to the server. Please try again later.'
      );
    }
    
    return errorResult;
  }
};

/**
 * Makes an API request with proper error handling
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    throw new Error('API URL not set. Cannot make request.');
  }
  const url = `${apiUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': Constants.expoConfig?.version ||'unknown',
        ...(options.headers || {}),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return { data, status: response.status };
  } catch (error: unknown) {
    console.error('API Request failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};
