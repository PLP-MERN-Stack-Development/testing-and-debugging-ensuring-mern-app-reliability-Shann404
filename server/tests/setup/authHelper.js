// server/tests/setup/authHelper.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

class AuthHelper {
  static async getAuthToken(userData = null) {
    try {
      // Create or use provided user
      const user = userData || {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      };
      
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(user);
      
      if (registerResponse.status !== 201) {
        console.log('Registration failed:', registerResponse.body);
        return null;
      }

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: user.password
        });

      if (loginResponse.status === 200 && loginResponse.body.token) {
        return loginResponse.body.token;
      } else {
        console.log('Login failed:', loginResponse.body);
        return null;
      }
    } catch (error) {
      console.log('Auth helper error:', error.message);
      return null;
    }
  }

  static async createAuthenticatedUser() {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Failed to create authenticated user');
    }
    return token;
  }
}

module.exports = AuthHelper;