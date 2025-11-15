// tests/api/posts.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Post = require('../../models/Post');
const jwt = require('jsonwebtoken');

describe('Posts API Endpoints', () => {
  let authorUser;
  let otherUser;
  let adminUser;
  let authorToken;
  let otherToken;
  let adminToken;
  let testPost;

  beforeEach(async () => {
    // Create users
    authorUser = await User.create({
      name: 'Author User',
      email: 'author@example.com',
      password: 'password123'
    });

    otherUser = await User.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123'
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Generate tokens
    authorToken = jwt.sign(
      { userId: authorUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    otherToken = jwt.sign(
      { userId: otherUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test post
    testPost = await Post.create({
      title: 'Test Post Title',
      content: 'Test post content here',
      author: authorUser._id,
      tags: ['test', 'javascript']
    });
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      // Create multiple posts for testing
      for (let i = 0; i < 5; i++) {
        await Post.create({
          title: `Post ${i}`,
          content: `Content ${i}`,
          author: authorUser._id,
          tags: i % 2 === 0 ? ['even'] : ['odd']
        });
      }
    });

    it('should return all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('posts');
      expect(response.body.data).toHaveProperty('totalCount');
      expect(response.body.data.posts).toHaveLength(6); // 1 initial + 5 new
    });

    it('should return paginated posts', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=3')
        .expect(200);

      expect(response.body.data.posts).toHaveLength(3);
      expect(response.body.data.totalCount).toBe(6);
      expect(response.body.data).toHaveProperty('currentPage', 1);
    });

    it('should filter posts by tags', async () => {
      const response = await request(app)
        .get('/api/posts?tags=even')
        .expect(200);

      expect(response.body.data.posts).toHaveLength(3); // 3 even posts
      response.body.data.posts.forEach(post => {
        expect(post.tags).toContain('even');
      });
    });

    it('should search posts by title', async () => {
      const response = await request(app)
        .get('/api/posts?search=Test Post')
        .expect(200);

      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].title).toBe('Test Post Title');
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return post by ID', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.post.title).toBe(testPost.title);
      expect(response.body.data.post.content).toBe(testPost.content);
      expect(response.body.data.post.author).toHaveProperty('name');
    });

    it('should increment views counter', async () => {
      const initialViews = testPost.views;

      await request(app)
        .get(`/api/posts/${testPost._id}`)
        .expect(200);

      // Check if views were incremented
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.views).toBe(initialViews + 1);
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Post not found');
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app)
        .get('/api/posts/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'New Post Title',
        content: 'New post content here',
        tags: ['new', 'test']
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.post.title).toBe(postData.title);
      expect(response.body.data.post.content).toBe(postData.content);
      expect(response.body.data.post.author._id).toBe(authorUser._id.toString());

      // Verify post was saved in database
      const post = await Post.findOne({ title: postData.title });
      expect(post).toBeTruthy();
      expect(post.author.toString()).toBe(authorUser._id.toString());
    });

    it('should return 401 without authentication', async () => {
      const postData = {
        title: 'New Post',
        content: 'Content'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

     it('should return 400 for missing required fields', async () => {
    const postData = {
      content: 'Content without title'
    };

    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send(postData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Title and content are required'); // Fixed expectation
  });

    it('should return 400 for empty title', async () => {
      const postData = {
        title: '   ',
        content: 'Valid content'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update post by author', async () => {
      const updateData = {
        title: 'Updated Post Title',
        content: 'Updated content here'
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.post.title).toBe(updateData.title);
      expect(response.body.data.post.content).toBe(updateData.content);

      // Verify update in database
      const updatedPost = await Post.findById(testPost._id);
      expect(updatedPost.title).toBe(updateData.title);
    });

    it('should allow admin to update any post', async () => {
      const updateData = {
        title: 'Admin Updated Title'
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.post.title).toBe(updateData.title);
    });

    it('should return 403 when non-author tries to update post', async () => {
      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Should not work' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/posts/${nonExistentId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Update' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete post by author', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('Post deleted');

      // Verify post is deleted
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('should allow admin to delete any post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 when non-author tries to delete post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});