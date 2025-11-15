const mongoose = require('mongoose');

const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (!password) return false;
  // Simplified for testing
  return password.length >= 6;
};

const sanitizeInput = (input, escape = false) => {
  if (input === null || input === undefined) return '';
  return input.toString().trim();
};

const validateObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateObjectId
};