import { Platform } from 'react-native';

// Function to get the base API URL
const getBaseUrl = () => {
  // For Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  
  // For iOS simulator or physical device on the same network
  if (process.env.NODE_ENV === 'development') {
    try {
      const os = require('os');
      const interfaces = os.networkInterfaces();
      
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          // Skip internal (non-IPv4) and non-internal (i.e., 127.0.0.1) addresses
          if ('IPv4' === iface.family && !iface.internal) {
            return `http://${iface.address}:8000`;
          }
        }
      }
    } catch (error) {
      console.warn('Could not determine local IP, falling back to localhost');
    }
  }
  
  // Fallback to localhost if in production or if IP detection fails
  return 'http://localhost:8000';
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