// tests/middleware/auth.test.js
const jwt = require('jsonwebtoken');
const { 
  authenticateToken, 
  authorize, 
  optionalAuth, 
  rateLimit 
} = require('../../middleware/auth');
const User = require('../../models/User');

jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' }
    };
    
    res = {
      statusCode: 200,
      _json: null,
      _headers: {},
      _ended: false,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this._json = data;
        this._ended = true;
        return this;
      },
      setHeader: function(name, value) {
        this._headers[name] = value;
        return this;
      },
      end: function() {
        this._ended = true;
        return this;
      }
    };
    
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
    
    jest.clearAllMocks();
  });

  // AUTHENTICATE TOKEN TESTS
  describe('authenticateToken', () => {
    it('should return 401 when no authorization header', async () => {
      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('Access token required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header has no Bearer token', async () => {
      req.headers.authorization = 'Basic abc123';

      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is empty', async () => {
      req.headers.authorization = 'Bearer ';

      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle JsonWebTokenError with 403 status', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res._json.message).toBe('Invalid token');
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle TokenExpiredError with 403 status', async () => {
      req.headers.authorization = 'Bearer expired-token';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res._json.message).toBe('Token expired');
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle database errors when finding user', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user123' });
      User.findById.mockRejectedValue(new Error('Database error'));

      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(500);
      expect(res._json.message).toBe('Authentication failed');
      expect(next).not.toHaveBeenCalled();
    });

    it('should successfully authenticate with valid token and active user', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        role: 'user',
        name: 'Test User'
      };
      
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.statusCode).not.toBe(401);
    });

    it('should handle unexpected errors gracefully', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authenticateToken(req, res, next);

      expect(res.statusCode).toBe(500);
      expect(res._json.message).toBe('Authentication failed');
    });
  });

  // AUTHORIZE MIDDLEWARE TESTS
  describe('authorize', () => {
    it('should return 401 when no user is present', () => {
      const middleware = authorize('admin', 'moderator');

      middleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res._json.message).toBe('Authentication required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not in allowed roles', () => {
      req.user = { role: 'user' };
      const middleware = authorize('admin', 'moderator');

      middleware(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res._json.message).toContain('Access denied');
      expect(res._json.message).toContain('admin, moderator');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when user has admin role', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin', 'moderator');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next when user has moderator role', () => {
      req.user = { role: 'moderator' };
      const middleware = authorize('admin', 'moderator');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should work with single role requirement', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle empty roles array', () => {
      req.user = { role: 'user' };
      const middleware = authorize();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // OPTIONAL AUTH TESTS
  describe('optionalAuth', () => {
    it('should call next without setting user when no token', async () => {
      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should set user when valid token and active user exists', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: true,
        role: 'user'
      };
      
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should not set user when user is inactive', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isActive: false,
        role: 'user'
      };
      
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user123' });
      User.findById.mockResolvedValue(mockUser);

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user on token verification error', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Token error');
      });

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user when user not found in database', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'nonexistent' });
      User.findById.mockResolvedValue(null);

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user123' });
      User.findById.mockRejectedValue(new Error('Database error'));

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  // RATE LIMITING TESTS
  describe('rateLimit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow requests within limit', () => {
      const middleware = rateLimit(3, 60000);
      
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(i + 1);
      }
      
      expect(res.statusCode).not.toBe(429);
    });

    it('should block requests exceeding limit', () => {
      const middleware = rateLimit(2, 60000);
      
      // Make 2 allowed requests
      middleware(req, res, next);
      middleware(req, res, next);
      
      // Third request should be blocked
      middleware(req, res, next);
      
      expect(res.statusCode).toBe(429);
      expect(res._json.message).toBe('Too many requests');
      expect(res._json.retryAfter).toBeDefined();
      expect(next).toHaveBeenCalledTimes(2);
    });

    it('should reset counter after time window', () => {
      const middleware = rateLimit(2, 60000);
      
      // Exceed limit
      middleware(req, res, next);
      middleware(req, res, next);
      middleware(req, res, next); // Blocked
      
      expect(res.statusCode).toBe(429);
      
      // Advance time beyond window
      jest.advanceTimersByTime(61000);
      
      // Should allow again
      const newRes = {
        ...res,
        statusCode: 200,
        _json: null,
        _ended: false
      };
      middleware(req, newRes, next);
      
      expect(newRes.statusCode).not.toBe(429);
    });

    it('should handle different IP addresses separately', () => {
      const middleware = rateLimit(1, 60000);
      
      // First IP uses its limit
      req.ip = '192.168.1.1';
      middleware(req, res, next);
      middleware(req, res, next); // Blocked for IP1
      
      expect(res.statusCode).toBe(429);
      
      // Second IP should be allowed
      req.ip = '192.168.1.2';
      const newRes = { ...res, statusCode: 200, _json: null, _ended: false };
      middleware(req, newRes, next);
      
      expect(newRes.statusCode).not.toBe(429);
    });

    it('should set proper rate limit headers', () => {
      const middleware = rateLimit(5, 60000);
      
      middleware(req, res, next);
      
      expect(res._headers['X-RateLimit-Limit']).toBe(5);
      expect(res._headers['X-RateLimit-Remaining']).toBe(4);
      expect(res._headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('should handle case with no IP address', () => {
      delete req.ip;
      delete req.connection.remoteAddress;
      
      const middleware = rateLimit(1, 60000);
      
      middleware(req, res, next);
      middleware(req, res, next); // Should be blocked even without IP
      
      expect(res.statusCode).toBe(429);
    });
  });
});