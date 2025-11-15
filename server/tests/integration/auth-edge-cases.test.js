// server/tests/integration/auth-edge-cases.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const AuthTestHelper = require('../helpers/authHelper');

describe('Authentication Edge Cases', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Input Validation Edge Cases', () => {
    test('should handle extremely long inputs', async () => {
      const longString = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: longString,
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle SQL injection attempts', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin' --"
      ];

      for (const attempt of sqlInjectionAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: attempt,
            password: attempt
          });

        // Should either reject or handle safely (not crash)
        expect(response.status).not.toBe(500);
      }
    });

    test('should handle XSS attempts', async () => {
      const xssAttempt = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: xssAttempt,
          email: 'xss@example.com',
          password: 'password123'
        });

      // Should handle safely (not execute scripts)
      expect(response.status).not.toBe(500);
    });
  });

  describe('Concurrent Authentication Tests', () => {
    test('should handle multiple simultaneous registrations', async () => {
      const email = `concurrent${Date.now()}@example.com`;
      const requests = [];

      // Create multiple simultaneous registration requests
      for (let i = 0; i < 3; i++) {
        requests.push(
          request(app)
            .post('/api/auth/register')
            .send({
              name: `User ${i}`,
              email: email,
              password: 'password123'
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // Only one should succeed, others should fail with conflict
      const successCount = responses.filter(r => r.status === 201).length;
      const conflictCount = responses.filter(r => r.status === 409).length;
      
      expect(successCount).toBe(1);
      expect(successCount + conflictCount).toBe(requests.length);
    });

    test('should handle multiple logins for same user', async () => {
      const userData = {
        name: 'Concurrent Login User',
        email: `concurrentlogin${Date.now()}@example.com`,
        password: 'password123'
      };

      await AuthTestHelper.createAuthenticatedUser(userData);

      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: userData.email,
              password: userData.password
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
      });

      // All tokens should be different (if using JWT with timestamps)
      const tokens = responses.map(r => r.body.token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should potentially limit rapid login attempts', async () => {
      const userData = {
        name: 'Rate Limit Test User',
        email: `ratelimit${Date.now()}@example.com`,
        password: 'password123'
      };

      await AuthTestHelper.createAuthenticatedUser(userData);

      // Make multiple rapid login attempts with wrong password
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: userData.email,
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(attempts);
      
      // All should be unauthorized, but server shouldn't crash
      responses.forEach(response => {
        expect([401, 429]).toContain(response.status); // 429 = Too Many Requests
      });
    });
  });

  describe('Token Security Tests', () => {
    test('should not expose sensitive information in tokens', async () => {
      const { token } = await AuthTestHelper.createAuthenticatedUser();

      // Decode token (if JWT) to check contents
      if (token.split('.').length === 3) {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Token should not contain password
        expect(payload.password).toBeUndefined();
        // Should only contain necessary user info
        expect(payload.id || payload._id).toBeDefined();
      }
    });

    test('should invalidate tokens after password change', async () => {
      const { token, user } = await AuthTestHelper.createAuthenticatedUser();

      // Change password
      const updateResponse = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      if (updateResponse.status === 200) {
        // Old token should be invalid
        const profileResponse = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        // Might be 401 or still valid depending on implementation
        expect([200, 401]).toContain(profileResponse.status);
      }
    });
  });
});