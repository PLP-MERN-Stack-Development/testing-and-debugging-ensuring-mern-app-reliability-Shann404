const express = require('express');
const Post = require('./models/Post');
const User = require('./models/User');
const { generateToken, verifyToken } = require('./utils/auth');

const app = express();

app.use(express.json());

// Mock authentication middleware for testing
const mockAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Mock authorization middleware
const mockAuthorize = (req, res, next) => {
  // For testing, allow if user ID matches or is the test user
  if (req.user.userId === req.params.userId || req.user.email === 'test@example.com') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// GET /api/posts - Return all posts or filtered by category
app.get('/api/posts', async (req, res) => {
  try {
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const posts = await Post.find(query)
      .limit(parseInt(req.query.limit) || 10)
      .skip(((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 10));
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/:id - Get specific post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(404).json({ error: 'Post not found' });
  }
});

// POST /api/posts - Create new post (requires auth)
app.post('/api/posts', mockAuth, async (req, res) => {
  try {
    // Validation
    if (!req.body.title || !req.body.content || !req.body.category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      author: req.user.userId,
      slug: req.body.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    });

    res.status(201).json(post);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// PUT /api/posts/:id - Update post (requires auth + ownership)
app.put('/api/posts/:id', mockAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden - not the author' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedPost);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// DELETE /api/posts/:id - Delete post (requires auth + ownership)
app.delete('/api/posts/:id', mockAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden - not the author' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;