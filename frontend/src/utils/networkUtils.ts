import { Alert } from 'react-native';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, getApiUrl } from '../config/api';

// Network status check
const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    if (!networkState.isConnected) {
      console.warn('[Network] No network connection');
      return false;
    }
    
    if (!networkState.isInternetReachable) {
      console.warn('[Network] No internet access');
      return false;
    }
    
    console.log(`[Network] Connected to ${networkState.type} network`);
    return true;
  } catch (error) {
    console.error('[Network] Error checking network status:', error);
    return false;
  }
};

// API request with retry logic
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<Response> => {
  try {
    const isConnected = await checkNetworkStatus();
    if (!isConnected) {
      throw new Error('No network connection');
    }

    // Create headers object
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    // Add custom headers if they exist
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers.set(key, value);
        });
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            headers.set(key, String(value));
          }
        });
      }
    }


    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok && retries > 0) {
      console.warn(`[API] Request failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, { ...options, headers }, retries - 1, delay * 2);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`[API] Request error, retrying... (${retries} attempts left)`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// API client with authentication
const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
) => {
  try {
    // Get the current API URL
    const baseUrl = await getApiUrl();
    const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    // Create headers with proper type
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    });

    // Add auth token if required
    if (requiresAuth) {
      const token = await getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetchWithRetry(url, {
      ...options,
      headers,
    });

    // Handle response
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      (error as any).response = response;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
};

// Helper methods for common HTTP methods
const api = {
  get: (endpoint: string, options: RequestInit = {}, requiresAuth = true) =>
    apiClient(endpoint, { ...options, method: 'GET' }, requiresAuth),
  
  post: (endpoint: string, data: any = {}, options: RequestInit = {}, requiresAuth = true) =>
    apiClient(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      },
      requiresAuth
    ),
  
  put: (endpoint: string, data: any = {}, options: RequestInit = {}, requiresAuth = true) =>
    apiClient(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
      },
      requiresAuth
    ),
  
  delete: (endpoint: string, options: RequestInit = {}, requiresAuth = true) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }, requiresAuth),
  
  patch: (endpoint: string, data: any = {}, options: RequestInit = {}, requiresAuth = true) =>
    apiClient(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      requiresAuth
    ),
};

export { checkNetworkStatus, fetchWithRetry, getAuthToken, apiClient, api };
export default api;
