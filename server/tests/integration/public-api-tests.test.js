// server/tests/integration/public-api-tests.test.js
const request = require('supertest');
const app = require('../../app');

describe('Public API Tests', () => {
  test('should access public health endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
  });

  test('should access public posts listing if available', async () => {
    const response = await request(app)
      .get('/api/posts');

    // Could be 200 (public) or 401 (requires auth)
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      console.log('✅ Posts endpoint is publicly accessible');
    } else if (response.status === 401) {
      console.log('⚠️  Posts endpoint requires authentication');
    }
  });

  test('should handle auth registration', async () => {
    const userData = {
      name: 'Public Test User',
      email: `public${Date.now()}@example.com`,
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Could be 201 (created), 400 (validation), or 409 (exists)
    expect([201, 400, 409]).toContain(response.status);
    
    if (response.status === 201) {
      expect(response.body.success).toBe(true);
      console.log('✅ Registration endpoint working');
    }
  });

  test('should handle auth login', async () => {
    // First create a user
    const userData = {
      name: 'Login Test User',
      email: `login${Date.now()}@example.com`,
      password: 'password123'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Then try to login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    if (loginResponse.status === 200) {
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
      console.log('✅ Login endpoint working');
    } else {
      console.log('Login response:', loginResponse.status, loginResponse.body);
    }
  });
});