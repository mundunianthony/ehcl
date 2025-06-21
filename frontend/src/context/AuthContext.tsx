import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { api } from '../config/api';
import { User } from '../types';
import { setUserEmail } from '../services/notificationService';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, first_name: string, last_name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthData = async () => {
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('refreshToken'),
      AsyncStorage.removeItem('user')
    ]);
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      // Get all auth data in parallel
      const [storedToken, refreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('user')
      ]);
      
      if (!storedToken || !storedUser) {
        console.log('[Auth] No stored auth data found');
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(storedUser);
      
      // Set the stored data immediately
      setToken(storedToken);
      setUser(user);
      
      // If we have a refresh token, try to refresh the access token in the background
      if (refreshToken) {
        // Don't block initialization for token refresh
        setTimeout(async () => {
          try {
            console.log('[Auth] Attempting to refresh access token in background...');
            // Use the refresh token to get a new access token
            const response = await api.post('token/refresh/', {
              refresh: refreshToken
            });
            
            const newAccessToken = response.data.access;
            
            if (newAccessToken) {
              console.log('[Auth] Token refresh successful');
              await AsyncStorage.setItem('token', newAccessToken);
              setToken(newAccessToken);
            }
          } catch (refreshError) {
            console.warn('[Auth] Token refresh failed, keeping existing token:', refreshError);
            // Don't clear auth data on refresh failure, just keep the existing token
          }
        }, 1000); // Delay refresh by 1 second to allow network to initialize
      }
    } catch (error) {
      console.error('[Auth] Error loading auth data:', error);
      // Don't clear auth data on error, just set loading to false
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    console.log('\n[Auth] === Login Process Started ===');
    console.log(`[Auth] Attempting login for: ${email}`);
    try {
      const startTime = Date.now();
      
      console.log('[Auth] Sending login request...');
      
      // Use the authAPI service
      const { access: accessToken, refresh: refreshToken, user: userData } = await authAPI.login({ email, password });
      
      const responseTime = Date.now() - startTime;
      console.log(`[Auth] Received response in ${responseTime}ms`);
      
      if (!accessToken || !userData) {
        console.error('[Auth] Missing required data:', { access: accessToken, refresh: refreshToken, user: userData });
        throw new Error('Invalid server response: missing required data');
      }
      
      console.log('[Auth] Login successful, user:', userData);
      
      // Store auth data
      await Promise.all([
        AsyncStorage.setItem('token', accessToken),
        AsyncStorage.setItem('refreshToken', refreshToken || ''),
        AsyncStorage.setItem('user', JSON.stringify(userData))
      ]);
      
      // Update state
      setToken(accessToken);
      setUser(userData as User);

      // Set user email for notification service
      setUserEmail(userData.email);

      console.log('[Auth] Auth state updated successfully');
    } catch (error: any) {
      console.error('[Auth] Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(
        error.message || 'An error occurred during login. Please try again.'
      );
    }
  };

  const logout = async () => {
    try {
      // Call the logout API
      if (token) {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Error during logout API call:', error);
          // Continue with local logout even if API call fails
        }
      }
      
      // Clear local storage and state
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // First, register the user with just email and password
      await authAPI.register({
        email,
        password,
        name,
      });
      
      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, first_name: string, last_name: string): Promise<void> => {
    try {
      // Use the authAPI service for registration with the expected interface
      await authAPI.register({
        email,
        password,
        name: `${first_name} ${last_name}`.trim()
      });
      
      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    signup,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 