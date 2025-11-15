// tests/api/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Auth API Endpoints', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id }, 
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify user was saved in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'test@example.com', // Already exists
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for invalid email format', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400); // This should now pass with the fixed route

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('valid email');
  });

  it('should return 400 for short password', async () => {
    const userData = {
      name: 'Test User',
      email: 'test2@example.com',
      password: '123' // Too short
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400); // This should now pass with the fixed route

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('least 6 characters');
  });

  it('should return 400 for missing required fields', async () => {
    const userData = {
      email: 'test2@example.com'
      // Missing name and password
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('required');
  });
});

  describe('POST /api/auth/login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired token
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token expired');
    });
  });

 describe('POST /api/auth/logout', () => {
  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .expect(401); // This should now pass with authentication required

    expect(response.body.success).toBe(false);
  });
  });
});