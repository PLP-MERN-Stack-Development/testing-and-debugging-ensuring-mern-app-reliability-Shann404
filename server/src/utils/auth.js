const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  if (!user || !user._id || !user.email) {
    throw new Error('User data is required');
  }
  
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password is required');
  }
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
};