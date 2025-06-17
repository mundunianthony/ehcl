import axios from 'axios';
import { API_URL, apiConfig } from '../config/api';
import { getHospitalImageUrl } from './hospitalImages';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

console.log('Initializing API with base URL:', API_URL);

// Create axios instance with better defaults
const api = axios.create({
  ...apiConfig,
  timeout: 60000, // 60 second timeout for mobile
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  // Disable withCredentials for mobile apps
  withCredentials: false,
  // Increase max content length
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
  // Add retry configuration
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  },
});

// Single request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip adding token for authentication endpoints
      const isAuthEndpoint = config.url?.includes('/users/login/') || 
                           config.url?.includes('/users/register/') ||
                           config.url?.includes('/users/logout/');
      
      if (!isAuthEndpoint) {
        // Get token based on platform
        let token = null;
        try {
          if (Platform.OS === 'web') {
            token = localStorage.getItem('access_token');
          } else {
            token = await SecureStore.getItemAsync('access_token');
          }
        } catch (err) {
          console.log('Error getting token:', err);
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // Remove any existing Authorization header for auth endpoints
        delete config.headers.Authorization;
      }

      // Add cache control headers
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';

      // Log request details
      console.log('\n[API Request]');
      console.log('Method:', config.method?.toUpperCase());
      console.log('URL:', config.url);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.log('---');

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Single response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('[API Response]');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('---');
    return response;
  },
  (error) => {
    // Log error details
    console.error('[API Response Error]');
    console.error('Error Message:', error.message);
    console.error('Status Code:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    console.error('Config:', error.config);
    console.error('---');

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please make sure you are connected to the same network as the server.');
      }
      if (error.message === 'canceled') {
        throw new Error('Connection was interrupted. Please check your internet connection and try again.');
      }
      throw new Error('Network error occurred. Please check your internet connection and try again.');
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    // Handle specific error cases
    if (status === 401) {
      throw new Error('Invalid email or password. Please try again.');
    }
    
    if (status === 403) {
      throw new Error('Access denied. You do not have permission.');
    }

    // Use detailed error message if available
    const errorMessage = data?.detail || data?.message || `HTTP error! status: ${status}`;
    throw new Error(errorMessage);
  }
);

// Geocode an address to coordinates
export const geocodeAddress = async (address: string, city: string, country: string = 'Uganda'): Promise<{latitude: number, longitude: number}> => {
  try {
    // Since we're using mock data and don't have a real geocoding service, 
    // we'll use a deterministic method to generate coordinates
    // In a real app, you would use a geocoding service like Google Maps Geocoding API
    
    // These are approximations for major cities in Uganda
    const cityCoordinates: {[key: string]: {lat: number, lng: number}} = {
      'Mbarara': {lat: -0.6177, lng: 30.6569},
      'Kampala': {lat: 0.3476, lng: 32.5825},
      'Jinja': {lat: 0.4478, lng: 33.2026},
      'Gulu': {lat: 2.7742, lng: 32.2780},
      'Lira': {lat: 2.2499, lng: 32.8998},
      'Entebbe': {lat: 0.0611, lng: 32.4511},
      // Add more cities as needed
    };
    
    // Try to find the city in our dictionary
    const cityName = city.trim();
    if (cityCoordinates[cityName]) {
      return {
        latitude: cityCoordinates[cityName].lat,
        longitude: cityCoordinates[cityName].lng
      };
    }
    
    // If city not found, hash the address to get consistent but random-looking coordinates
    // This is just for demo purposes
    const hashCode = (s: string) => {
      let h = 0;
      for(let i = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      return h;
    };
    
    const hash = hashCode(address + city);
    // Generate coordinates within Uganda's rough bounds
    const latOffset = (hash % 1000) / 10000; // Small variation
    const lngOffset = ((hash >> 10) % 1000) / 10000; // Small variation
    
    // Base coordinates for Uganda
    const baseLatitude = 1.3733; // Center of Uganda
    const baseLongitude = 32.2903;
    
    return {
      latitude: baseLatitude + latOffset,
      longitude: baseLongitude + lngOffset
    };
  } catch (error) {
    console.error('Failed to geocode address:', error);
    // Return default coordinates for Uganda
    return {latitude: 1.3733, longitude: 32.2903};
  }
};

export default api;

// Hospital Management Functions
export const getAllHospitals = async (
  search?: string, 
  district?: string, 
  condition?: string,
  emergency?: boolean,
  ambulance?: boolean,
  pharmacy?: boolean,
  lab?: boolean
) => {
  try {
    const params: any = {};
    if (search) params.search = search;
    if (district) params.district = district;
    if (condition) params.condition = condition;
    if (emergency !== undefined) params.emergency = emergency;
    if (ambulance !== undefined) params.ambulance = ambulance;
    if (pharmacy !== undefined) params.pharmacy = pharmacy;
    if (lab !== undefined) params.lab = lab;

    console.log('Making API request to /hospitals/ with params:', params);
    const response = await api.get("/hospitals/", { params });
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    const hospitals = response.data;
    
    // Process hospitals to add coordinates and image URLs
    const processedHospitals = await Promise.all(hospitals.map(async (hospital: any) => {
      // Add coordinates if not available
      let coords = hospital.coords;
      if (!coords) {
        coords = await geocodeAddress(hospital.address, hospital.city);
      }
      
      // Add image URL if not available
      const imageUrl = hospital.image || getHospitalImageUrl(hospital.name);
      
      return {
        ...hospital,
        coords,
        email: hospital.email || '',
        phone: hospital.phone || '',
        imageUrl: imageUrl.startsWith('http') ? imageUrl : `http://${imageUrl}`
      };
    }));
    
    return processedHospitals;
  } catch (error) {
    console.error("Failed to fetch hospitals:", error);
    throw error;
  }
};

export const getHospital = async (id: string) => {
  try {
    const response = await api.get(`/hospitals/${id}`);
    const hospital = response.data;
    
    // Add coordinates if not available
    if (!hospital.coords) {
      hospital.coords = await geocodeAddress(hospital.address, hospital.city);
    }
    
    return hospital;
  } catch (error) {
    console.warn("Failed to fetch hospital");
    throw error;
  }
};

export const createHospital = async (
  hospitalData: {
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
  },
  token: string
) => {
  try {
    const response = await api.post(
      "/hospitals/create/",
      hospitalData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create hospital:", error);
    throw error;
  }
};

// Add token retrieval function
const getToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('access_token');
    } else {
      return await SecureStore.getItemAsync('access_token');
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const addHospital = async (hospitalData: {
  name: string;
  district: string;
  address: string;
  description: string;
  email: string;
  phone: string;
  conditions_treated: string;
  images: string[];
  coords: {
    latitude: number;
    longitude: number;
  };
}) => {
  try {
    // Log the data being sent
    console.log('Attempting to create hospital with data:', JSON.stringify(hospitalData, null, 2));
    
    // Use the create endpoint and format data for backend
    const response = await api.post('/hospitals/create/', {
      ...hospitalData,
      city: hospitalData.district, // Map district to city for backend
      country: 'Uganda' // Add default country
    });
    
    // Log the response
    console.log('Hospital creation response:', response.data);
    
    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.error('Error creating hospital:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// User Authentication Functions
export const registerUser = async (userData: { 
  email: string; 
  password: string; 
  username: string;
  first_name: string;
  last_name: string;
}) => {
  try {
    const response = await api.post("/users/register/", {
      email: userData.email,
      password: userData.password,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register user:", error);
    throw error;
  }
};

export const loginUser = async (userData: { email: string; password: string }) => {
  try {
    const response = await api.post("/users/login/", userData);
    return response.data;
  } catch (error) {
    console.error("Failed to login user:", error);
    throw error;
  }
};

export const logoutUser = async (refreshToken: string) => {
  try {
    await api.post(
      "/users/logout/",
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Failed to logout user:", error);
    throw error;
  }
};
