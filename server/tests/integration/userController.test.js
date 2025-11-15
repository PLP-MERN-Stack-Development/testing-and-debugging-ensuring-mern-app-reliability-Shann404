// server/tests/integration/userController.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const { connectTestDB, clearTestDB } = require('../setup/testDB');

describe('User Controller Integration Tests', () => {
  let testUser;
  let adminUser;
  let authToken;
  let normalUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
  await clearTestDB(); // clear DB before each test

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: `admin${Date.now()}@example.com`,
    password: 'password123',
    role: 'admin'
  });

  // Login admin to get token
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password: 'password123' });

  authToken = res.body.token;
});


  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /api/users', () => {
    test('should fetch all users', async () => {
      // Create multiple users
      await User.create([
        { name: 'User 1', email: `user1${Date.now()}@example.com`, password: 'pass123' },
        { name: 'User 2', email: `user2${Date.now()}@example.com`, password: 'pass123' }
      ]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3); // testUser + 2 others
    });

    test('should return empty array when no other users exist', async () => {
      await clearTestDB(); // Ensure DB is empty

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const newUser = {
        name: 'New User',
        email: `new${Date.now()}@example.com`,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(newUser.name);

      const dbUser = await User.findOne({ email: newUser.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(newUser.name);
    });

    test('should return 400 for invalid user data', async () => {
      const invalidUser = { name: 'Invalid' }; // missing email + password

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUser)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
