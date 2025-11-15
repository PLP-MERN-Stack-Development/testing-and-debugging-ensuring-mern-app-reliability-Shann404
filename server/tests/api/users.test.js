// tests/api/users.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Users API Endpoints', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create regular user
    regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { userId: regularUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('totalCount');
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.users[0]).not.toHaveProperty('password');
    });

    it('should return paginated users', async () => {
      // Create more users for pagination test
      for (let i = 0; i < 5; i++) {
        await User.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'password123'
        });
      }

      const response = await request(app)
        .get('/api/users?page=1&limit=3')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.users).toHaveLength(3);
      expect(response.body.data.totalCount).toBe(7); // 2 existing + 5 new
      expect(response.body.data).toHaveProperty('currentPage', 1);
      expect(response.body.data).toHaveProperty('totalPages', 3);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.email).toBe(regularUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should allow users to get their own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.user._id).toBe(regularUser._id.toString());
    });

    it('should return 403 when user tries to access other user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
    const response = await request(app)
      .get('/api/users/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid user ID'); // Fixed expectation
  });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe(updateData.email);

      // Verify update in database
      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(updateData.email);
    });

    it('should allow admin to update any user', async () => {
      const updateData = {
        name: 'Admin Updated Name'
      };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.user.name).toBe(updateData.name);
    });

    it('should return 403 when user tries to update other user', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Should not work' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for duplicate email', async () => {
      const updateData = {
        email: 'admin@example.com' // Already exists
      };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('User deleted');

      // Verify user is deleted
      const deletedUser = await User.findById(regularUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should allow users to delete their own account', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 when user tries to delete other user', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});