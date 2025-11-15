// server/routes/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware');
const userController = require('../controllers/userController');

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

router.post('/', authMiddleware, adminMiddleware, userController.createUser);


// GET /api/users - Get all users (admin only)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only access their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove password from update data to prevent direct password updates
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only delete their own account unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;