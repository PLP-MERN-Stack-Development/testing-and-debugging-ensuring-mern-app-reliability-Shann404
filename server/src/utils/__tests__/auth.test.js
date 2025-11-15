const {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
} = require('../auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Authentication Utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com'
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const mockToken = 'mock.jwt.token';
      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      expect(token).toBe(mockToken);
    });

    it('should throw error if user data is invalid', () => {
      expect(() => generateToken(null)).toThrow('User data is required');
      expect(() => generateToken({})).toThrow('User ID and email are required');
    });
  });

  describe('verifyToken', () => {
    it('should verify and return decoded token', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecoded = { userId: mockUser._id, email: mockUser.email };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(result).toEqual(mockDecoded);
    });

    it('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid.token')).toThrow('Invalid token');
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password is required');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword('wrong', 'hashed');

      expect(result).toBe(false);
    });
  });
});