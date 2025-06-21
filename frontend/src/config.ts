import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Production API URL
const PRODUCTION_API_URL = 'https://ehcl-production.up.railway.app';

// Function to get the base API URL
const getBaseUrl = () => {
  // Check for environment variable first
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envApiUrl && envApiUrl !== 'http://10.10.162.57:8000') {
    console.log('[Config] Using environment API URL:', envApiUrl);
    return envApiUrl;
  }

  // Check if we're in production mode
  if (process.env.NODE_ENV === 'production' || __DEV__ === false) {
    console.log('[Config] Using production API URL:', PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
  }

  // For Android emulator in development
  if (Platform.OS === 'android') {
    const androidUrl = 'http://10.0.2.2:8000';
    console.log('[Config] Using Android emulator URL:', androidUrl);
    return androidUrl;
  }

  // For iOS simulator or physical device on the same network in development
  try {
    const os = require('os');
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal (non-IPv4) and non-internal (i.e., 127.0.0.1) addresses
        if ('IPv4' === iface.family && !iface.internal) {
          const localUrl = `http://${iface.address}:8000`;
          console.log('[Config] Using local network URL:', localUrl);
          return localUrl;
        }
      }
    }
  } catch (error) {
    console.warn('Could not determine local IP, falling back to localhost');
  }

  // Fallback to localhost if IP detection fails
  const fallbackUrl = 'http://localhost:8000';
  console.log('[Config] Using fallback URL:', fallbackUrl);
  return fallbackUrl;
};

// Use the appropriate base URL based on platform and environment
export const API_URL = `${getBaseUrl()}/api`;

export const ENDPOINTS = {
  login: `${API_URL}/users/login/`,
  register: `${API_URL}/users/register/`,
  logout: `${API_URL}/users/logout/`,
  notifications: `${API_URL}/notifications/`,
  hospitals: `${API_URL}/hospitals/`,
  healthCenters: `${API_URL}/health-centers/`,
};

export const APP_NAME = 'Health Center Locator';
export const APP_VERSION = '1.0.0'; 