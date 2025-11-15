// server/tests/helpers/authHelper.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

class AuthTestHelper {
  /**
   * Create a test user and return auth token
   */
  static async createAuthenticatedUser(userData = {}) {
    const defaultUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      ...userData
    };

    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(defaultUser);

    if (registerResponse.status !== 201) {
      throw new Error(`Registration failed: ${registerResponse.body.error}`);
    }

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: defaultUser.email,
        password: defaultUser.password
      });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.body.error}`);
    }

    return {
      user: loginResponse.body.data,
      token: loginResponse.body.token,
      rawData: defaultUser
    };
  }

  /**
   * Get auth headers for authenticated requests
   */
  static getAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Clean up test users
   */
  static async cleanupTestUsers() {
    await User.deleteMany({
      email: { $regex: /test.*@example\.com/ }
    });
  }
}

module.exports = AuthTestHelper;