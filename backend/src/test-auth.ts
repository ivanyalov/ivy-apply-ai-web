import axios from 'axios';

const BASE_URL = '/api/auth';
const testEmail = `testuser_${Date.now()}@example.com`;
const testPassword = 'testpassword123';

async function testAuthFlow() {
  try {
    // 1. Sign up
    console.log('Testing signup...');
    const signupRes = await axios.post(`${BASE_URL}/signup`, {
      email: testEmail,
      password: testPassword,
    });
    console.log('Signup response:', signupRes.data);

    // 2. Sign in
    console.log('Testing signin...');
    const signinRes = await axios.post(`${BASE_URL}/signin`, {
      email: testEmail,
      password: testPassword,
    });
    console.log('Signin response:', signinRes.data);
    const token = signinRes.data.token;

    // 3. Get current user
    console.log('Testing get current user...');
    const meRes = await axios.get(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Current user response:', meRes.data);

    console.log('Auth flow test completed successfully!');
  } catch (error: any) {
    if (error.response) {
      console.error('Error response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuthFlow(); 