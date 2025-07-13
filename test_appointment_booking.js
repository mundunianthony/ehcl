const axios = require('axios');

// Test appointment booking with proper authentication
async function testAppointmentBooking() {
  const baseUrl = 'http://localhost:8000';
  
  try {
    console.log('=== Testing Appointment Booking ===');
    
    // Step 1: Login as a regular user
    console.log('\n1. Logging in as regular user...');
    const loginResponse = await axios.post(`${baseUrl}/api/users/login/`, {
      email: 'jane@example.com',
      password: 'janepass'
    });
    
    const { access: userToken } = loginResponse.data;
    console.log('✅ User login successful');
    
    // Step 2: Book an appointment
    console.log('\n2. Booking appointment...');
    const appointmentPayload = {
      user: 2, // Jane's user ID
      hospital: 222, // Hospital ID
      date: '2025-07-10T12:00:00.000Z',
      message: 'Test appointment booking',
      phone: '+256 5555555'
    };
    
    const appointmentResponse = await axios.post(
      `${baseUrl}/api/appointments/`,
      appointmentPayload,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Appointment booked successfully:', appointmentResponse.data);
    
    // Step 3: Login as hospital staff to view appointments
    console.log('\n3. Logging in as hospital staff...');
    const hospitalLoginResponse = await axios.post(`${baseUrl}/api/hospitals/login/`, {
      email: 'admin.mbarararegiona@hospital.com',
      password: 'password1234'
    });
    
    const { access: hospitalToken } = hospitalLoginResponse.data;
    console.log('✅ Hospital login successful');
    
    // Step 4: Get hospital dashboard
    console.log('\n4. Getting hospital dashboard...');
    const dashboardResponse = await axios.get(
      `${baseUrl}/api/hospital/dashboard/`,
      {
        headers: {
          'Authorization': `Bearer ${hospitalToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Hospital dashboard retrieved:', dashboardResponse.data);
    
    // Step 5: Get all appointments
    console.log('\n5. Getting all appointments...');
    const appointmentsResponse = await axios.get(
      `${baseUrl}/api/appointments/`,
      {
        headers: {
          'Authorization': `Bearer ${hospitalToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Appointments retrieved:', appointmentsResponse.data);
    
    console.log('\n🎉 All tests passed! Appointment booking is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testAppointmentBooking(); 