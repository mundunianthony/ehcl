import { api } from '../config/api';

export const testHospitalEndpoints = async () => {
  console.log('🧪 Testing Hospital Endpoints...');
  
  const baseUrl = 'http://10.10.162.30:8000'; // Your detected server URL
  
  const endpoints = [
    '/api/hospitals/',
    '/api/hospitals/all/',
    '/api/hospitals/nearby/',
    '/api/available-districts/',
    '/api/health/',
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📦 Response:`, data);
      } else {
        console.log(`❌ Error: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Network Error:`, error);
    }
  }
  
  console.log('\n🧪 Endpoint testing complete!');
};

export const testFrontendAPI = async () => {
  console.log('🧪 Testing Frontend API calls...');
  
  try {
    // Test the API client directly
    console.log('\n🔍 Testing API client...');
    const response = await api.get('hospitals/all/');
    console.log(`✅ API Response:`, response.data);
  } catch (error) {
    console.log(`❌ API Error:`, error);
  }
}; 