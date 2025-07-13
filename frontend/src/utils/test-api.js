// Test utility for checking API and network connectivity
const fetch = require('node-fetch');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const API_BASE_URL = 'https://web-production-52fc7.up.railway.app';
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'testpass123'
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Network connectivity tests
async function checkNetwork() {
  console.log('🔍 Checking network connectivity...');

  try {
    // Check internet connectivity
    console.log('🌐 Testing internet connectivity...');
    await fetch('https://www.google.com');
    console.log('✅ Internet connection is working');

    // Check local network
    console.log('📡 Testing local network...');
    await fetch('http://10.10.162.68:8000', { timeout: 5000 });
    console.log('✅ Local server is reachable');

    return true;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   - DNS resolution failed. Check your network connection.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   - Connection refused. Is the Django server running?');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   - Connection timed out. Check your network or server.');
    }
    return false;
  }
}

// API endpoint tests
async function testApiEndpoints() {
  console.log('\n🔌 Testing API endpoints...');

  try {
    // Test base API endpoint
    console.log('🔄 Testing base API endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/`);
    console.log(`✅ Base API status: ${response.status}`);

    // Test login endpoint
    console.log('\n🔑 Testing login endpoint...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password
      })
    });

    console.log(`✅ Login endpoint status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Main function to run all tests
async function runTests() {
  console.log('🚀 Starting connectivity tests...');

  const networkOk = await checkNetwork();
  if (!networkOk) {
    console.log('\n❌ Network tests failed. Please fix network issues first.');
    return;
  }

  const apiOk = await testApiEndpoints();
  if (!apiOk) {
    console.log('\n❌ API tests failed. Please check your API server.');
    return;
  }

  console.log('\n🎉 All tests passed successfully!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
testApiConnection();
