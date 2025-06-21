import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { api as configApi, getAuthToken, setAuthToken, tokenStorage } from '../config/api';
import { Alert, Platform } from 'react-native';

// User interface for auth context
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  is_staff: boolean;
  is_admin: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  groups: string[];
  user_permissions: string[];
}

// Types
interface Hospital {
  id: string;
  name: string;
  district: string;
  city?: string;
  description: string;
  address: string;
  coords: { latitude: number; longitude: number };
  imageUrl: string;
  email?: string;
  phone?: string;
  specialties?: string;
  conditions_treated?: string;
  is_emergency?: boolean;
  has_ambulance?: boolean;
  has_pharmacy?: boolean;
  has_lab?: boolean;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

// Auth API interfaces
interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface LocationResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationCreate {
  name: string;
  latitude: number;
  longitude: number;
}

interface NearbyHospitalsParams {
  lat: number;
  lng: number;
  radius?: number;
}

// Use the working API client from config/api.ts directly
export const api = {
  get: async (url: string, config?: any) => {
    console.log(`[API] GET ${url}`, { config });
    try {
      const response = await configApi.get(url, config);
      console.log(`[API] GET ${url} success`);
      return response;
    } catch (error) {
      console.error(`[API] GET ${url} error:`, error);
      throw error;
    }
  },
  post: async (url: string, data?: any, config?: any) => {
    console.log(`[API] POST ${url}`, { data, config });
    try {
      const response = await configApi.post(url, data, config);
      console.log(`[API] POST ${url} success`);
      return response;
    } catch (error) {
      console.error(`[API] POST ${url} error:`, error);
      throw error;
    }
  },
  put: async (url: string, data?: any, config?: any) => {
    console.log(`[API] PUT ${url}`, { data, config });
    try {
      const response = await configApi.put(url, data, config);
      console.log(`[API] PUT ${url} success`);
      return response;
    } catch (error) {
      console.error(`[API] PUT ${url} error:`, error);
      throw error;
    }
  },
  delete: async (url: string, config?: any) => {
    console.log(`[API] DELETE ${url}`, { config });
    try {
      const response = await configApi.delete(url, config);
      console.log(`[API] DELETE ${url} success`);
      return response;
    } catch (error) {
      console.error(`[API] DELETE ${url} error:`, error);
      throw error;
    }
  },
  request: async (config: any) => {
    console.log('[API] REQUEST', { config });
    try {
      const response = await configApi.request(config);
      console.log('[API] REQUEST success', { url: config.url });
      return response;
    } catch (error) {
      console.error('[API] REQUEST error:', error);
      throw error;
    }
  },
};

// Hospital API calls
const hospitalAPI = {
  getAll: async (): Promise<Hospital[]> => {
    try {
      const response = await api.get('/hospitals/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hospitals:', error.message);
      throw error;
    }
  },
  getById: async (id: string): Promise<Hospital> => {
    try {
      const response = await api.get(`/hospitals/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching hospital ${id}:`, error.message);
      throw error;
    }
  },
  create: async (data: Omit<Hospital, 'id'>): Promise<Hospital> => {
    try {
      const response = await api.post('/hospitals/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating hospital:', error.message);
      throw error;
    }
  },
  update: async (id: string, data: Partial<Hospital>): Promise<Hospital> => {
    try {
      const response = await api.put(`/hospitals/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating hospital ${id}:`, error.message);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/hospitals/${id}/`);
    } catch (error: any) {
      console.error(`Error deleting hospital ${id}:`, error.message);
      throw error;
    }
  },
  getNearbyHospitals: async (params: NearbyHospitalsParams): Promise<Hospital[]> => {
    try {
      const response = await api.get('/hospitals/nearby/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching nearby hospitals:', error.message);
      throw error;
    }
  },
};

// Location API calls
const locationAPI = {
  getAll: async (): Promise<Location[]> => {
    try {
      const response = await api.get('/locations/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching locations:', error.message);
      throw error;
    }
  },
  getById: async (id: string): Promise<Location> => {
    try {
      const response = await api.get(`/locations/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching location:', error.message);
      throw error;
    }
  },
  create: async (data: Omit<Location, 'id'>): Promise<Location> => {
    try {
      const response = await api.post('/locations/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating location:', error.message);
      throw error;
    }
  },
  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    try {
      const response = await api.put(`/locations/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating location:', error.message);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/locations/${id}/`);
    } catch (error: any) {
      console.error('Error deleting location:', error.message);
      throw error;
    }
  }
};

// Auth API calls
const authAPI = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    console.log('[Auth] Sending login request...', { 
      email: credentials.email,
      endpoint: 'users/login/'
    });
    setAuthToken(null);
    await tokenStorage.remove();
    
    try {
      const response = await api.post('users/login/', credentials, {
        headers: { 'Content-Type': 'application/json' },
        skipAuth: true
      });

      const data = response.data;
      console.log('[Auth] Login response data:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: data
      });
      
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      
      if (typeof data === 'object' && data !== null) {
        if ('access' in data) accessToken = data.access;
        if ('refresh' in data) refreshToken = data.refresh;
        if (!accessToken && 'access_token' in data) accessToken = data.access_token;
        if (!refreshToken && 'refresh_token' in data) refreshToken = data.refresh_token;
        if (!accessToken && 'token' in data) accessToken = data.token;
      } else if (typeof data === 'string') {
        accessToken = data;
      }
      
      console.log('[Auth] Extracted tokens:', { accessToken, refreshToken });
      
      if (!accessToken) {
        throw new Error('No access token found in response');
      }
      
      setAuthToken(accessToken);
      await tokenStorage.set(accessToken);
      console.log('[Auth] Token stored successfully');
      
      let userData: User = data.user;
      if (!userData) {
        try {
          const userResponse = await api.get('users/me/');
          userData = userResponse.data;
        } catch (userError) {
          console.warn('Failed to fetch user details, using minimal user object:', userError);
          userData = {
            id: data.user_id?.toString() || 'unknown',
            email: credentials.email,
            username: credentials.email.split('@')[0],
            name: credentials.email.split('@')[0],
            first_name: null,
            last_name: null,
            is_staff: false,
            is_admin: false,
            is_active: true,
            date_joined: new Date().toISOString(),
            last_login: new Date().toISOString(),
            groups: [],
            user_permissions: []
          };
        }
      } else {
        userData = {
          id: userData.id?.toString() || 'unknown',
          email: userData.email || credentials.email,
          username: userData.username || userData.email?.split('@')[0] || credentials.email.split('@')[0],
          name: userData.name || userData.email?.split('@')[0] || credentials.email.split('@')[0],
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          is_staff: userData.is_staff || false,
          is_admin: userData.is_admin || false,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          date_joined: userData.date_joined || new Date().toISOString(),
          last_login: userData.last_login || new Date().toISOString(),
          groups: userData.groups || [],
          user_permissions: userData.user_permissions || []
        };
      }
      
      console.log('[Auth] Login successful, user:', userData);
      return { 
        access: accessToken, 
        refresh: refreshToken || '', 
        user: userData 
      };
    } catch (error: any) {
      console.error('[Auth] Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response) {
        if (error.response.status === 400) {
          throw new Error('Invalid email or password');
        } else if (error.response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (error.response.data) {
          const errorMessage = error.response.data.detail || 
                             error.response.data.error ||
                             error.response.data.message ||
                             'An error occurred during login';
          throw new Error(errorMessage);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your internet connection.');
      }
      
      console.error('Login request error:', error.message);
      throw error;
    }
  },
  
  getUserDetails: async (token: string): Promise<User> => {
    try {
      const response = await api.get('api/users/me/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('[Auth] Error fetching user details:', error);
      throw error;
    }
  },
  
  register: async (userData: { email: string; password: string; name: string }): Promise<RegisterResponse> => {
    try {
      const response = await api.post('/users/register/', userData);
      return response.data;
    } catch (error: any) {
      console.error('[Auth] Registration error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  
  logout: async (): Promise<void> => {
    try {
      await api.post('/users/logout/');
    } catch (error: any) {
      console.error('[Auth] Logout error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
};

// Notification API calls
const notificationAPI = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('notifications/');
      console.log('Notifications response:', response.data);
      
      if (response.data && response.data.results) {
        return response.data.results;
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
      throw error;
    }
  },
  
  markAsRead: async (id: number): Promise<void> => {
    try {
      await api.post(`notifications/${id}/mark_read/`);
    } catch (error: any) {
      console.error('Error marking notification as read:', error.message);
      throw error;
    }
  }
};

// Export all API services
export const apiServices = {
  auth: authAPI,
  hospital: hospitalAPI,
  location: locationAPI,
  notification: notificationAPI,
};

// Export individual API service objects
export { authAPI, hospitalAPI, locationAPI, notificationAPI };

// Export TypeScript interfaces
export type {
  User,
  Hospital,
  Location,
  Notification,
  AuthCredentials,
  AuthResponse,
  RegisterResponse,
  LocationResponse,
  LocationCreate,
  NearbyHospitalsParams
};
