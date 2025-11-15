// server/routes/posts.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify token and get user
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = await User.findById(decoded.userId);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// GET /api/posts - Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];

    let query = { isPublished: true };
    
    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by tags
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
});

// GET /api/posts/:id - Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
});

// POST /api/posts - Create new post
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      author: req.user._id
    });

    await post.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const updateData = req.body;

    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

module.exports = router;