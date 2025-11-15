// tests/middleware/errorHandler.test.js
const { errorHandler, asyncHandler, notFound } = require('../../middleware/errorHandler');

describe('Error Handling Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      originalUrl: '/api/test'
    };
    
    res = {
      statusCode: 200,
      _json: null,
      _ended: false,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this._json = data;
        this._ended = true;
        return this;
      }
    };
    
    next = jest.fn();
    console.error = jest.fn();
    process.env.NODE_ENV = 'test';
  });

  describe('errorHandler', () => {
    it('should handle generic errors with 500 status', () => {
      const error = new Error('Generic error');

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(500);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('Generic error');
      expect(res._json.stack).toBeUndefined(); // Stack not included in test env
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Development error');

      errorHandler(error, req, res, next);

      expect(res._json.stack).toBeDefined();
      process.env.NODE_ENV = 'test';
    });

    it('should handle CastError (Mongoose bad ObjectId)', () => {
      const error = new Error('Cast error');
      error.name = 'CastError';

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(404);
      expect(res._json.message).toBe('Resource not found');
    });

    it('should handle duplicate key error (code 11000)', () => {
      const error = new Error('Duplicate key');
      error.code = 11000;

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.message).toBe('Duplicate field value entered');
    });

    it('should handle ValidationError from Mongoose', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        email: { message: 'Email is required' },
        name: { message: 'Name is too short' }
      };

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.message).toContain('Email is required');
      expect(res._json.message).toContain('Name is too short');
    });

    it('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res._json.message).toBe('Invalid token');
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res._json.message).toBe('Token expired');
    });

    it('should use existing status code if set', () => {
      const error = new Error('Custom error');
      error.statusCode = 418;

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(418);
    });

    it('should use error message from custom error', () => {
      const error = new Error('Custom error message');
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res._json.message).toBe('Custom error message');
    });
  });

   describe('asyncHandler', () => {
    it('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = asyncHandler(async (req, res, next) => {
        throw error;
      });

      await asyncFn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should work correctly when async function succeeds', async () => {
      const asyncFn = asyncHandler(async (req, res, next) => {
        res.status(201).json({ success: true, data: 'created' });
      });

      await asyncFn(req, res, next);

      expect(res.statusCode).toBe(201);
      expect(res._json.success).toBe(true);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle synchronous errors in async function', async () => {
      const asyncFn = asyncHandler((req, res, next) => {
        // This synchronous function throws an error
        throw new Error('Sync error in async handler');
      });

      await asyncFn(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].message).toBe('Sync error in async handler');
    });

    it('should handle promise rejections', async () => {
      const asyncFn = asyncHandler(async (req, res, next) => {
        return Promise.reject(new Error('Promise rejected'));
      });

      await asyncFn(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].message).toBe('Promise rejected');
    });

    it('should handle successful synchronous functions', async () => {
      const syncFn = asyncHandler((req, res, next) => {
        res.status(200).json({ success: true });
      });

      await syncFn(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res._json.success).toBe(true);
      expect(next).not.toHaveBeenCalled();
    });
  });
  describe('notFound', () => {
    it('should create 404 error and pass to next', () => {
      notFound(req, res, next);

      expect(res.statusCode).toBe(404);
      expect(next).toHaveBeenCalled();
      
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Not found');
      expect(error.message).toContain('/api/test');
    });

    it('should include original URL in error message', () => {
      req.originalUrl = '/api/nonexistent';

      notFound(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('/api/nonexistent');
    });
  });
});