// tests/middleware/validation.test.js
const Joi = require('joi');
const { validateBody, validateParams, validateQuery } = require('../../middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
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
  });

  describe('validateBody', () => {
    const userSchema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      age: Joi.number().integer().min(0).max(120).optional(),
      tags: Joi.array().items(Joi.string()).optional()
    });

    it('should call next for valid data', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        tags: ['user', 'premium']
      };

      validateBody(userSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res._ended).toBe(false);
    });

    it('should return 400 for missing required field', () => {
      req.body = {
        name: 'John Doe'
        // email missing
      };

      validateBody(userSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.success).toBe(false);
      expect(res._json.details).toContain('"email" is required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', () => {
      req.body = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      validateBody(userSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.details[0]).toContain('email');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for name too short', () => {
      req.body = {
        name: 'J',
        email: 'john@example.com'
      };

      validateBody(userSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.details[0]).toContain('name');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid age value', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: -5
      };

      validateBody(userSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.details[0]).toContain('age');
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with optional fields omitted', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      validateBody(userSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.statusCode).not.toBe(400);
    });
  });

  describe('validateParams', () => {
    const idSchema = Joi.object({
      id: Joi.string().alphanum().length(24).required(),
      action: Joi.string().valid('view', 'edit', 'delete').optional()
    });

    it('should validate valid parameters', () => {
      req.params = { 
        id: '507f1f77bcf86cd799439011',
        action: 'view'
      };

      validateParams(idSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid ID format', () => {
      req.params = { id: 'invalid-id' };

      validateParams(idSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.message).toBe('Invalid parameters');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid action value', () => {
      req.params = { 
        id: '507f1f77bcf86cd799439011',
        action: 'invalid-action'
      };

      validateParams(idSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with only required parameters', () => {
      req.params = { id: '507f1f77bcf86cd799439011' };

      validateParams(idSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    const paginationSchema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().max(100).optional(),
      sort: Joi.string().valid('asc', 'desc').default('desc')
    });

    it('should set default values for missing query params', () => {
      req.query = {};

      validateQuery(paginationSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.page).toBe(1);
      expect(req.query.limit).toBe(10);
      expect(req.query.sort).toBe('desc');
    });

    it('should validate and use provided values', () => {
      req.query = {
        page: '2',
        limit: '20',
        search: 'test query',
        sort: 'asc'
      };

      validateQuery(paginationSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.page).toBe(2);
      expect(req.query.limit).toBe(20);
      expect(req.query.search).toBe('test query');
      expect(req.query.sort).toBe('asc');
    });

    it('should return 400 for invalid page number', () => {
      req.query = {
        page: '0', // Should be at least 1
        limit: '10'
      };

      validateQuery(paginationSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._json.message).toBe('Invalid query parameters');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for limit too high', () => {
      req.query = {
        page: '1',
        limit: '150' // Max is 100
      };

      validateQuery(paginationSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid sort value', () => {
      req.query = {
        page: '1',
        limit: '10',
        sort: 'invalid'
      };

      validateQuery(paginationSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});