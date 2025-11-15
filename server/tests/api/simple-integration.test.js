// server/tests/api/simple-integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Simple Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Authentication Flow', () => {
    it('should complete full auth flow: register -> login -> get profile', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'password123'
      };

      // 1. Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      const authToken = registerResponse.body.data.token;

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      // 3. Get profile
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.user.email).toBe(userData.email);
    });
  });

  describe('Posts API', () => {
    let authToken;

    beforeEach(async () => {
      // Create a user and get token
      const user = await User.create({
        name: 'Post Test User',
        email: 'posttest@example.com',
        password: 'password123'
      });

      // Generate token manually for testing
      const jwt = require('jsonwebtoken');
      authToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    it('should create and retrieve posts', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'Test post content here',
        tags: ['test', 'integration']
      };

      // Create post
      const createResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.post.title).toBe(postData.title);

      // Get all posts
      const getResponse = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.posts.length).toBeGreaterThan(0);
    });
  });
});