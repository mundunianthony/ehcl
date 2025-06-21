import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { registerUser } from '../utils/api';
import { Platform } from 'react-native';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  response?: {
    data?: {
      email?: string[];
      username?: string[];
      [key: string]: any;
    };
  };
  message?: string;
}

// Helper functions for storage that work on both web and mobile
const storeData = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    console.error('Error storing data:', e);
  }
};

const getData = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (e) {
    console.error('Error getting data:', e);
    return null;
  }
};

const removeData = async (key: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (e) {
    console.error('Error removing data:', e);
  }
};

// Initialize API when the app starts
// This will be handled inside the AuthProvider component
// The useEffect hook will be moved there to follow React rules

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  // Keep these for backward compatibility
  is_admin?: boolean;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{
    id: any;
    email: any;
    username: any;
    first_name: any;
    last_name: any;
    is_staff: any;
    is_admin: any;
    isAdmin: any;
  }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string, first_name: string, last_name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // We no longer need to initialize API base URL

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error on successful auth actions
    if (user || token) {
      setError(null);
    }
  }, [user, token]);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await getData('user');
        const storedToken = await getData('access_token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          // Ensure is_staff is properly set when loading from storage
          const userWithStaff = {
            ...parsedUser,
            is_staff: parsedUser.is_staff || false,
            // For backward compatibility
            is_admin: parsedUser.is_staff || false,
            isAdmin: parsedUser.is_staff || false
          };
          setUser(userWithStaff);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear any existing tokens before login
      await removeData('access_token');
      await removeData('refresh_token');
      await removeData('user');
      
      console.log('\n[AuthContext Login]');
      console.log('Attempting login with:', { email });
      console.log('Password length:', password.length);
      
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Make the login request
        console.log('Making login request...');
        const response = await api.post('users/login/',
          { email, password },
          { 
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        // Get the response data
        const responseData = response.data;
        console.log('Login response status:', response.status);
        console.log('Login response data:', responseData);
        
        // Validate the response data
        if (!responseData) {
          throw new Error('No data received from server');
        }
        
        // Handle the response format from the backend
        if (responseData.access && responseData.refresh && responseData.user) {
          // Format: { access: '...', refresh: '...', user: {...} }
          const userData = {
            id: responseData.user.id,
            email: responseData.user.email,
            username: responseData.user.username || email.split('@')[0],
            first_name: responseData.user.first_name || '',
            last_name: responseData.user.last_name || '',
            is_staff: responseData.user.is_staff || false,
            is_admin: responseData.user.is_staff || false,
            isAdmin: responseData.user.is_staff || false
          };
          
          // Store the data
          await storeData('refresh_token', responseData.refresh);
          await storeData('access_token', responseData.access);
          await storeData('user', JSON.stringify(userData));

          // Set the user and token state
          setUser(userData);
          setToken(responseData.access);
          setLoading(false);
          console.log('Login successful');
          return userData;
        } else {
          console.error('Unexpected response format:', responseData);
          throw new Error('Invalid server response format');
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Login error:', error);
        
        // Extract error message from response if available
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           error.message || 
                           'Login failed. Please check your credentials.';
        
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, first_name: string, last_name: string) => {
    try {
      console.log('Attempting registration with:', { email, username });
      
      // Use the registerUser utility function
      const response = await registerUser({
        email,
        password,
        username,
        first_name,
        last_name,
      });

      // Handle response
      if (response) {
        const { access, refresh, user } = response;
        
        // Store the data
        await storeData('refresh_token', String(refresh));
        await storeData('access_token', String(access));
        await storeData('user', JSON.stringify(user));
        
        // Update context state
        setUser(user);
        setToken(access);
        setError(null);
        setLoading(false);
        return response;
      } else {
        throw new Error('Registration failed: No response data');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const error = err as unknown as ApiErrorResponse;
      const errorMessage = error.response?.data?.email?.[0] || 
                         error.response?.data?.username?.[0] ||
                         (error.message || 'Registration failed');
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      let refreshToken;
      if (Platform.OS === 'web') {
        refreshToken = localStorage.getItem('refresh_token');
      } else {
        refreshToken = await getData('refresh_token');
      }
      
      if (refreshToken) {
        try {
          // Try to logout using the refresh token
          await api.post('/users/logout/', { refresh_token: refreshToken });
          console.log('Logout API call successful');
        } catch (logoutError) {
          console.error('Logout API error:', logoutError);
          // Even if logout fails, we should still clear local storage
        }
      }

      // Clear all stored data
      if (Platform.OS === 'web') {
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } else {
        await removeData('refresh_token');
        await removeData('access_token');
        await removeData('user');
      }
      
      setUser(null);
      setToken(null);
      console.log('Logout successful, user state cleared');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  };

  return {
    ...context,
    error: context.error
  };
};

// This is a dummy AuthContext to avoid conflicts with the correct one in 'context'
console.warn('Using deprecated AuthContext from contexts/AuthContext.tsx. Please use the one from context/AuthContext.tsx');

export function DummyAuthProvider({ children }: { children: React.ReactNode }) {
  console.warn('Using deprecated AuthProvider from contexts/AuthContext.tsx. Please use the one from context/AuthContext.tsx');
  return <>{children}</>;
}

export function useDummyAuth() {
  console.warn('Using deprecated useAuth from contexts/AuthContext.tsx. Please use the one from context/AuthContext.tsx');
  return { user: null, token: null, isLoading: false, login: () => {}, logout: () => {}, signup: () => {} };
}
