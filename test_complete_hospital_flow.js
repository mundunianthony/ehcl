const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testCompleteHospitalFlow() {
  console.log('=== Testing Complete Hospital Registration & Profile Setup Flow ===\n');
  
  try {
    // Test data
    const testEmail = `complete.flow.${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log('1. Testing hospital registration...');
    console.log('Test email:', testEmail);
    
    const registrationResponse = await axios.post(`${BASE_URL}/hospitals/register/`, {
      user_email: testEmail,
      password: testPassword
    });
    
    console.log('✅ Hospital registration successful');
    console.log('Response status:', registrationResponse.status);
    console.log('Response data:', registrationResponse.data);
    
    // Test auto-login after registration
    console.log('\n2. Testing auto-login after registration...');
    const loginResponse = await axios.post(`${BASE_URL}/hospitals/login/`, {
      email: testEmail,
      password: testPassword
    });
    
    const { access: token } = loginResponse.data;
    console.log('✅ Auto-login successful');
    console.log('Token received:', token.substring(0, 50) + '...');
    
    // Test accessing hospital profile (should work after auto-login)
    console.log('\n3. Testing hospital profile access after auto-login...');
    const profileResponse = await axios.get(`${BASE_URL}/hospital/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Hospital profile access successful');
    console.log('Profile data:', profileResponse.data);
    
    // Test updating hospital details (Step 1)
    console.log('\n4. Testing hospital details update (Step 1)...');
    const updateResponse = await axios.put(`${BASE_URL}/hospital/profile/`, {
      name: 'Test Hospital Complete Flow',
      description: 'A comprehensive test hospital for flow verification',
      phone: '+256 700 123456',
      email: testEmail,
      is_emergency: true,
      has_ambulance: true,
      has_pharmacy: true,
      has_lab: true,
      country: 'Uganda',
      city: 'Kampala',
      address: '123 Test Street, Kampala'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Hospital details update successful');
    console.log('Update response:', updateResponse.data);
    
    // Test hospital dashboard access
    console.log('\n5. Testing hospital dashboard access...');
    const dashboardResponse = await axios.get(`${BASE_URL}/hospital/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Hospital dashboard access successful');
    console.log('Dashboard data:', dashboardResponse.data);
    
    // Test logout
    console.log('\n6. Testing hospital logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/users/logout/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Hospital logout successful');
    console.log('Logout response:', logoutResponse.data);
    
    // Test that profile is no longer accessible after logout
    console.log('\n7. Testing profile access after logout (should fail)...');
    try {
      await axios.get(`${BASE_URL}/hospital/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ Profile still accessible after logout - this is unexpected');
    } catch (error) {
      console.log('✅ Profile correctly inaccessible after logout');
      console.log('Expected error status:', error.response?.status);
    }
    
    console.log('\n🎉 Complete hospital flow test successful!');
    console.log('✅ Registration → Auto-login → Profile access → Details update → Dashboard → Logout');
    console.log('✅ All steps completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteHospitalFlow(); 