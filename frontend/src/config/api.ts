import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { Platform, Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkManager from '../utils/NetworkManager';

declare const __DEV__: boolean;

// Define types for API response
type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
  request?: any;
};

// Extended error type for API errors
class ApiError extends Error {
  status?: number;
  data?: any;
  isAxiosError: boolean;

  constructor(message: string, status?: number, data?: any, isAxiosError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isAxiosError = isAxiosError;
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Helper type for error responses from the API
interface ApiErrorResponse {
  message?: string;
  detail?: string;
  [key: string]: any;
}

// Helper to normalize URL
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/([^:]\/)\/+/g, '$1');
};

// Enhanced server URL detection with NetworkManager integration
const getServerUrl = async (): Promise<string> => {
  try {
    console.log('[API] Getting server URL...');
    
    // Use NetworkManager to get the current server URL
    const baseUrl = await NetworkManager.getBaseUrl();
    
    if (baseUrl) {
      console.log('[API] Using NetworkManager server URL:', baseUrl);
      return baseUrl;
    }
    
    // If no URL is found, throw an error to indicate a connection problem
    throw new Error('Could not determine server URL. Please check your network connection.');
  } catch (error) {
    console.error('[API] Error getting server URL:', error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
};

// Function to ensure proper URL formatting
const formatApiUrl = async (endpoint: string): Promise<string> => {
  try {
    // Get base URL from environment or use default
    let baseUrl = await getServerUrl();
    
    // Ensure base URL doesn't end with a slash
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Remove leading slash from endpoint if it exists
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Special handling for auth endpoints - they should be at /api/token/, not just /token/
    if (cleanEndpoint.startsWith('token/') || cleanEndpoint === 'token' || 
        cleanEndpoint.startsWith('api/token/') || cleanEndpoint === 'api/token') {
      // Ensure we have the correct /api/token/ format
      const authEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
      const url = `${baseUrl}/${authEndpoint}`.replace(/([^:]\/)\/+/g, '$1');
      console.log(`[API] Formatted auth URL: ${url}`);
      return url;
    }
    
    // For other endpoints, ensure they start with api/
    const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
    
    // Combine base URL and endpoint
    const fullUrl = `${baseUrl}/${apiEndpoint}`;
    
    // Normalize the URL to remove any double slashes
    const normalizedUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');
    
    console.log(`[API] Formatted URL: ${normalizedUrl}`);
    return normalizedUrl;
  } catch (error) {
    console.error('[API] Error formatting URL:', error);
    throw error;
  }
};

// For backward compatibility
export let API_URL = ''; // Will be set dynamically

// Add the missing getCurrentApiUrl function
export const getCurrentApiUrl = async (): Promise<string> => {
  try {
    return await getServerUrl();
  } catch (error) {
    console.error('[API] Error getting current API URL:', error);
    return '';
  }
};

// Add missing exports for backward compatibility
export const getApiUrl = async (): Promise<string> => {
  return await getCurrentApiUrl();
};

export const apiConfig = {
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Create API client with default empty config
let apiInstance: AxiosInstance | null = null;
let isInitializing = false;
let initPromise: Promise<AxiosInstance> | null = null;

// Create API error
const createApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.detail || data?.message || error.message || 'Network error occurred';
    return new ApiError(message, status, data, true);
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError('An unknown error occurred');
};

// Initialize the API client
const initializeApiClient = async (): Promise<AxiosInstance> => {
  if (apiInstance) {
    return apiInstance;
  }

  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      console.log('[API] Initializing API client...');
      
      // Get the server URL
      const serverUrl = await getServerUrl();
      console.log('[API] Server URL for API client:', serverUrl);
      
      // Create axios instance
      apiInstance = axios.create({
        baseURL: serverUrl,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
    },
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status < 500,
  });

      // Add enhanced request interceptor
      apiInstance.interceptors.request.use(
    async (config) => {
          console.log('[API] Request interceptor called for URL:', config.url);
      try {
        const token = await AsyncStorage.getItem('token');
        
        // Create a new config with updated headers
        const newConfig = { ...config };
        
        // Ensure headers exist
        if (!newConfig.headers) {
          newConfig.headers = {} as AxiosRequestHeaders;
        }
        
        // Set default headers if not already set
        if (!newConfig.headers['Content-Type']) {
          newConfig.headers['Content-Type'] = 'application/json';
        }
        
        if (!newConfig.headers['Accept']) {
          newConfig.headers['Accept'] = 'application/json';
        }
        
        // Add auth token if available
        if (token) {
          newConfig.headers.Authorization = `Bearer ${token}`;
        }
            
            // Fix URL to include /api/ prefix for all endpoints
            if (newConfig.url) {
              let url = newConfig.url;
              console.log('[API] Original URL:', url);
              
              // Remove leading slash if present
              if (url.startsWith('/')) {
                url = url.substring(1);
                console.log('[API] Removed leading slash:', url);
              }
              
              // Skip if already has /api/ prefix or is a health check
              if (!url.startsWith('api/') && !url.startsWith('/api/') && 
                  !url.startsWith('health') && !url.startsWith('/health') &&
                  !url.startsWith('admin') && !url.startsWith('/admin') &&
                  !url.startsWith('__debug__') && !url.startsWith('/__debug__')) {
                newConfig.url = `api/${url}`;
                console.log(`[API] Fixed URL: ${url} -> api/${url}`);
              } else {
                console.log(`[API] URL already has correct prefix or is excluded: ${url}`);
              }
              
              // Final check: ensure no double slashes
              if (newConfig.url && newConfig.url.includes('//')) {
                newConfig.url = newConfig.url.replace(/\/+/g, '/');
                console.log(`[API] Fixed double slashes: ${newConfig.url}`);
              }
            }
        
        // Log request in development
        if (__DEV__) {
          const method = (config.method || 'get').toUpperCase();
              const url = newConfig.url || 'unknown-url';
          const params = config.params ? { params: config.params } : {};
          const data = config.data ? { data: config.data } : {};
          
          console.log(`[API] ${method} ${url}`, { ...params, ...data });
        }
        
        return newConfig;
      } catch (error) {
        console.error('[API] Error in request interceptor:', error);
        return Promise.reject(createApiError(error));
      }
    },
    (error: AxiosError) => {
      console.error('[API] Request error:', error);
      return Promise.reject(createApiError(error));
    }
  );

      // Add enhanced response interceptor with network reconnection logic
      apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (__DEV__) {
        const method = response.config?.method?.toUpperCase() || 'GET';
        const url = response.config?.url || 'unknown-url';
        console.log(`[API] Response ${response.status}: ${method} ${url}`);
      }
      return response;
    },
    async (error) => {
      const apiError = createApiError(error);
          
          // Handle network-related errors
          if (apiError.status === 0 || apiError.message.includes('Network Error')) {
            console.warn('[API] Network error detected, triggering network refresh...');
            
            // Try to refresh the network connection
            try {
              await NetworkManager.refresh();
              
              // Get the new server URL
              const newServerUrl = await NetworkManager.getBaseUrl();
              if (newServerUrl && apiInstance && newServerUrl !== apiInstance.defaults.baseURL) {
                console.log('[API] Network refreshed, updating API client base URL:', newServerUrl);
                apiInstance.defaults.baseURL = newServerUrl;
                
                // Retry the original request with the new URL
                const originalRequest = error.config;
                if (originalRequest) {
                  console.log('[API] Retrying request with new server URL...');
                  return apiInstance.request(originalRequest);
                }
              }
            } catch (networkError) {
              console.error('[API] Failed to refresh network:', networkError);
            }
          }
      
      // Handle 401 Unauthorized
      if (apiError.status === 401) {
        try {
          // Clear auth token
          await AsyncStorage.removeItem('token');
          // TODO: Use navigation service to redirect to login screen
          console.log('[API] Authentication required - redirecting to login');
        } catch (storageError) {
          console.error('[API] Failed to clear auth token:', storageError);
        }
      }
      
      // Log error in development
      if (__DEV__) {
        const errorInfo = {
          message: apiError.message,
          status: apiError.status,
          url: error.config?.url || 'unknown-url',
          method: error.config?.method || 'unknown-method',
        };
        console.error('[API] Response error:', errorInfo);
      }
      
      return Promise.reject(apiError);
    }
  );

      console.log('[API] API client initialized successfully');
      return apiInstance;
    } catch (error) {
      console.error('[API] Failed to initialize API client:', error);
      throw createApiError(error);
    } finally {
      isInitializing = false;
      initPromise = null;
    }
})();

  return initPromise;
};

// Get the API instance, initializing if necessary
const getApiInstance = async (): Promise<AxiosInstance> => {
  if (!apiInstance) {
    await initializeApiClient();
  }
  return apiInstance!;
};

// Store the auth token
export let authToken: string | null = null;

// Create a safe API instance that handles initialization
const createSafeApiInstance = () => {
  return {
    get: async (url: string, config?: any) => {
      const instance = await getApiInstance();
      return instance.get(url, config);
    },
    post: async (url: string, data?: any, config?: any) => {
      const instance = await getApiInstance();
      return instance.post(url, data, config);
    },
    put: async (url: string, data?: any, config?: any) => {
      const instance = await getApiInstance();
      return instance.put(url, data, config);
    },
    delete: async (url: string, config?: any) => {
      const instance = await getApiInstance();
      return instance.delete(url, config);
    },
    patch: async (url: string, data?: any, config?: any) => {
      const instance = await getApiInstance();
      return instance.patch(url, data, config);
    },
    request: async (config: any) => {
      const instance = await getApiInstance();
      return instance.request(config);
    },
    defaults: {
      get baseURL() {
        return apiInstance?.defaults.baseURL || '';
      },
      set baseURL(url: string) {
        if (apiInstance) {
          apiInstance.defaults.baseURL = url;
        }
      }
    }
  };
};

// Export the safe API instance
export const api = createSafeApiInstance();

// Token management
export const getAuthToken = (): string | null => authToken;
export const setAuthToken = (token: string | null): void => { authToken = token; };

export const tokenStorage = {
  get: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('token');
  },
  set: async (token: string): Promise<void> => {
    await AsyncStorage.setItem('token', token);
  },
  remove: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
  },
};

// Function to reset the API client (useful for testing)
export const resetApiClient = () => {
  console.log('[API] Resetting API client...');
  apiInstance = null;
  isInitializing = false;
  initPromise = null;
};

// Initialize the API client when the module is loaded
initializeApiClient().catch(error => {
  console.error('[API] Failed to initialize API client on module load:', error);
});