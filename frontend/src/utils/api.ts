import axios from 'axios';
import { api as configApi } from '../config/api';
import { getHospitalImageUrl } from './hospitalImages';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

console.log('Using configured API instance from config/api.ts');

// Use the configured API instance from config/api.ts
const api = configApi;

// Note: Request and response interceptors are handled in config/api.ts

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
  city?: string, 
  condition?: string,
  emergency?: boolean,
  ambulance?: boolean,
  pharmacy?: boolean,
  lab?: boolean
) => {
  try {
    const params: any = {};
    if (search) params.search = search;
    if (city) params.city = city;
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
  city: string;
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

// Hospital Registration with User Account
export const registerHospital = async (hospitalData: {
  name: string;
  city: string;
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
  // Hospital user credentials
  user_email: string;
  password: string;
  // Additional hospital fields
  is_emergency?: boolean;
  has_ambulance?: boolean;
  has_pharmacy?: boolean;
  has_lab?: boolean;
}) => {
  try {
    // Log the data being sent
    console.log('Attempting to register hospital with data:', JSON.stringify(hospitalData, null, 2));
    
    // Use the hospital registration endpoint
    const response = await api.post('/hospitals/register/', {
      name: hospitalData.name,
      description: hospitalData.description,
      address: hospitalData.address,
      city: hospitalData.city,
      country: 'Uganda',
      email: hospitalData.email,
      phone: hospitalData.phone,
      is_emergency: hospitalData.is_emergency || true,
      has_ambulance: hospitalData.has_ambulance || false,
      has_pharmacy: hospitalData.has_pharmacy || true,
      has_lab: hospitalData.has_lab || false,
      specialties: '',
      conditions_treated: hospitalData.conditions_treated,
      // User credentials
      user_email: hospitalData.user_email,
      password: hospitalData.password,
    });
    
    // Log the response
    console.log('Hospital registration response:', response.data);
    
    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.error('Error registering hospital:', {
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
    const response = await api.post("users/login/", userData);
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
