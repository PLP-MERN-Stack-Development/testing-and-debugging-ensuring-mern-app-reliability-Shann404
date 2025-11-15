const {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateObjectId
} = require('../validation');
const mongoose = require('mongoose');

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('SecurePass1@')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      // Too short
      expect(validatePassword('Short1!')).toBe(false);
      // No uppercase
      expect(validatePassword('password123!')).toBe(false);
      // No lowercase
      expect(validatePassword('PASSWORD123!')).toBe(false);
      // No number
      expect(validatePassword('Password!!!')).toBe(false);
      // No special character
      expect(validatePassword('Password123')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags and trim whitespace', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>Hello  '))
        .toBe('Hello');
      expect(sanitizeInput('<div>Test &amp; Example</div>'))
        .toBe('Test &amp; Example');
    });

    it('should handle null and undefined values', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('should escape special characters when escape=true', () => {
      const result = sanitizeInput('<div>"Test" & "Example"</div>', true);
      expect(result).toBe('&quot;Test&quot; &amp; &quot;Example&quot;');
    });
  });

  describe('validateObjectId', () => {
    it('should return true for valid MongoDB ObjectId', () => {
      const validId = new mongoose.Types.ObjectId();
      expect(validateObjectId(validId.toString())).toBe(true);
    });

    it('should return false for invalid ObjectId', () => {
      expect(validateObjectId('invalid')).toBe(false);
      expect(validateObjectId('123')).toBe(false);
      expect(validateObjectId('')).toBe(false);
      expect(validateObjectId(null)).toBe(false);
    });
  });
});