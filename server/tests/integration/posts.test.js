// server/tests/integration/posts.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { connectTestDB, clearTestDB } = require('../setup/testDB');

let admin, testUser, authToken;

describe('Posts API Integration Tests', () => {

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    // Clear all collections
    await clearTestDB();

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('password123', 10);
    admin = await User.create({
      name: 'Admin User',
      email: `admin${Date.now()}@example.com`,
      password: hashedAdminPassword,
      role: 'admin'
    });

    // Create regular test user
    const hashedTestUserPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      name: 'Test User',
      email: `user${Date.now()}@example.com`,
      password: hashedTestUserPassword
    });

    // Login admin to get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: 'password123' });
    authToken = res.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // -------------------------
  // POST /api/posts
  // -------------------------
  describe('POST /api/posts', () => {
    test('should create a new post when authenticated', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        category: 'testing',
        author: admin._id
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.content).toBe(postData.content);
    });

    test('should return 401 if not authenticated', async () => {
      const postData = { title: 'Test Post', content: 'Content' };

      await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);
    });

    test('should return 400 if validation fails', async () => {
      const invalidPostData = { title: '', content: 'Content without title' };

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPostData)
        .expect(400);
    });
  });

  // -------------------------
  // GET /api/posts
  // -------------------------
  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await Post.create([
        { title: 'Tech Post', content: 'Tech content', category: 'tech', author: admin._id },
        { title: 'Life Post', content: 'Life content', category: 'lifestyle', author: admin._id }
      ]);
    });

    test('should return all posts', async () => {
      const response = await request(app).get('/api/posts').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(2);
      expect(response.body.data.totalCount).toBe(2);
    });

    test('should filter posts by category', async () => {
      const response = await request(app).get('/api/posts?category=tech').expect(200);

      expect(response.body.success).toBe(true);
      const techPosts = response.body.data.posts.filter(post => post.category === 'tech');
      expect(techPosts.length).toBeGreaterThan(0);
    });
  });

  // -------------------------
  // GET /api/posts/:id
  // -------------------------
  describe('GET /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Single Post',
        content: 'Single post content',
        category: 'testing',
        author: testUser._id
      });
    });

    test('should return a post by ID', async () => {
      const response = await request(app).get(`/api/posts/${testPost._id}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Single Post');
    });
  });
});
