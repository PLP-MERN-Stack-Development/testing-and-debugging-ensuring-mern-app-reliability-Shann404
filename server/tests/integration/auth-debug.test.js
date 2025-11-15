// server/tests/integration/auth-debug.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Authentication Debug Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('should debug authentication flow step by step', async () => {
    console.log('\n=== AUTHENTICATION DEBUG ===');
    
    // Step 1: Register a user
    const userData = {
      name: 'Debug User',
      email: `debug${Date.now()}@example.com`,
      password: 'password123'
    };

    console.log('1. Registering user...');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    console.log('   Register status:', registerResponse.status);
    console.log('   Register body:', registerResponse.body);

    if (registerResponse.status !== 201) {
      console.log('   ❌ Registration failed');
      return;
    }

    // Step 2: Login to get token
    console.log('2. Logging in...');
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    console.log('   Login status:', loginResponse.status);
    console.log('   Login body:', loginResponse.body);

    if (loginResponse.status !== 200 || !loginResponse.body.token) {
      console.log('   ❌ Login failed or no token received');
      return;
    }

    const authToken = loginResponse.body.token;
    console.log('   ✅ Token received:', authToken.substring(0, 20) + '...');

    // Step 3: Test token with /api/auth/me
    console.log('3. Testing token with /api/auth/me...');
    const profileResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    console.log('   Profile status:', profileResponse.status);
    console.log('   Profile body:', profileResponse.body);

    // Step 4: Test token with /api/users
    console.log('4. Testing token with /api/users...');
    const usersResponse = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    console.log('   Users status:', usersResponse.status);
    console.log('   Users body:', usersResponse.body);

    // Step 5: Test token with /api/posts
    console.log('5. Testing token with /api/posts (POST)...');
    const postsResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Post',
        content: 'Test content'
      });

    console.log('   Posts status:', postsResponse.status);
    console.log('   Posts body:', postsResponse.body);

    // Analysis
    console.log('\n=== ANALYSIS ===');
    if (profileResponse.status === 200) {
      console.log('✅ Token works for /api/auth/me');
    } else {
      console.log('❌ Token does NOT work for /api/auth/me');
    }

    if (usersResponse.status === 200) {
      console.log('✅ Token works for /api/users');
    } else {
      console.log(`❌ Token does NOT work for /api/users (status: ${usersResponse.status})`);
    }

    if (postsResponse.status === 201) {
      console.log('✅ Token works for /api/posts');
    } else {
      console.log(`❌ Token does NOT work for /api/posts (status: ${postsResponse.status})`);
    }

    // This test passes as long as we complete the debug process
    expect(loginResponse.status).toBe(200);
  });
});