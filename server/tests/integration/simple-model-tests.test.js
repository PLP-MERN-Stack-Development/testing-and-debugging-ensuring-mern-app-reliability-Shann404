// server/tests/integration/simple-model-tests.test.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const Post = require('../../models/Post');

describe('Simple Model Tests (No API Calls)', () => {
  beforeAll(async () => {
    // Connection handled by global setup
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('should create and find users via model', async () => {
    const user = await User.create({
      name: 'Model Test User',
      email: `model${Date.now()}@example.com`,
      password: 'password123'
    });

    expect(user._id).toBeDefined();
    expect(user.name).toBe('Model Test User');

    // Find the user
    const foundUser = await User.findById(user._id);
    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(user.email);
  });

  test('should create posts with user reference', async () => {
    const user = await User.create({
      name: 'Post Author',
      email: `author${Date.now()}@example.com`,
      password: 'password123'
    });

    const post = await Post.create({
      title: 'Model Created Post',
      content: 'This post was created directly via model',
      author: user._id,
      category: 'testing'
    });

    expect(post._id).toBeDefined();
    expect(post.title).toBe('Model Created Post');
    expect(post.author.toString()).toBe(user._id.toString());

    // Find post with populated author
    const foundPost = await Post.findById(post._id).populate('author');
    expect(foundPost.author.name).toBe('Post Author');
  });

  test('should validate user model requirements', async () => {
    // Test validation - should fail without required fields
    try {
      await User.create({ name: 'Incomplete User' });
      // If we get here, validation didn't work
      expect(true).toBe(false); // Force test failure
    } catch (error) {
      expect(error.name).toBe('ValidationError');
      expect(error.errors.email).toBeDefined();
    }
  });

  test('should validate post model requirements', async () => {
    const user = await User.create({
      name: 'Validator',
      email: `validator${Date.now()}@example.com`,
      password: 'password123'
    });

    // Test validation - should fail without title
    try {
      await Post.create({
        content: 'No title provided',
        author: user._id
      });
      expect(true).toBe(false); // Force test failure
    } catch (error) {
      expect(error.name).toBe('ValidationError');
      expect(error.errors.title).toBeDefined();
    }
  });
});