import axios, { AxiosError } from 'axios';
import { apiConfig, getAuthToken } from '../config/api';
import { Alert, Platform } from 'react-native';

// Create axios instance with default config
const api = axios.create(apiConfig);

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Debug logging - log all requests
    console.log(`REQUEST: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Check if this is an auth endpoint and handle specially
    if (config.url?.includes('/users/login/') || 
        config.url?.includes('/users/register/')) {
      console.log('Skipping auth token for auth endpoint:', config.url);
      return config;
    }
    
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No auth token found');
      }
    } catch (error) {
      console.warn('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE [${response.status}]: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please check your connection and try again.';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.response) {
      // Server responded with a status code outside 2xx
      console.error(`❌ API ERROR [${error.response.status}]: ${error.config?.url}`);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.data) {
        // Try to get error message from response
        const data = error.response.data as any;
        errorMessage = data.message || data.detail || JSON.stringify(data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No response received for request:', error.config?.url);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      console.error('❌ Request setup error:', error.message);
      errorMessage = `Request error: ${error.message}`;
    }
    
    // Show error alert in development
    if (__DEV__) {
      Alert.alert(
        'API Error',
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
    
    // Return a rejected promise with the error message
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('Attempting login with credentials:', credentials);
    
    return api.post('/users/login/', credentials).catch(error => {
      console.error('Login error details:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received - network issue');
      }
      throw error;
    });
  },
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/users/register/', userData),
  logout: () => api.post('/users/logout/'),
};

// Hospital API calls
export const hospitalAPI = {
  getAll: () => api.get('/hospitals/'),
  getById: (id: string) => api.get(`/hospitals/${id}/`),
  create: (data: any) => api.post('/hospitals/', data),
  update: (id: string, data: any) => api.put(`/hospitals/${id}/`, data),
  delete: (id: string) => api.delete(`/hospitals/${id}/`),
};

// Location API calls
export const locationAPI = {
  getAll: () => api.get('/locations/'),
  getById: (id: string) => api.get(`/locations/${id}/`),
  create: (data: any) => api.post('/locations/', data),
  update: (id: string, data: any) => api.put(`/locations/${id}/`, data),
  delete: (id: string) => api.delete(`/locations/${id}/`),
};

export default api; 