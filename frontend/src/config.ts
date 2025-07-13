import { Platform } from 'react-native';

// Function to get the base API URL
const getBaseUrl = () => {
  // Use environment variable if set (for production flexibility)
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  // For development, try to use localhost first, then fallback to hardcoded IP
  if (__DEV__) {
    // Try localhost first
    return 'http://localhost:8000';
  }

  // Production fallback: use local backend
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