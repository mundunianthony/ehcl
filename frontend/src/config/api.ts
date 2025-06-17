import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// API URL Configuration
const DEV_API_URL = 'https://7599-62-8-83-27.ngrok-free.app/api';
const PROD_API_URL = 'https://api.emergencyhealthcenter.com/api/';

// Use environment-specific URL
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Configuration
export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increased timeout for mobile
  withCredentials: false // Disabled for mobile apps
};

// Helper function to get auth token
export const getAuthToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to set auth token
export const setAuthToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('access_token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Helper function to remove auth token
export const removeAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync('access_token');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Log API configuration
console.log(`[API Config] Final API URL: ${API_URL}`);
console.log(`[API Config] Platform: ${Platform.OS}`);
console.log(`[API Config] Environment: ${__DEV__ ? 'Development' : 'Production'}`); 