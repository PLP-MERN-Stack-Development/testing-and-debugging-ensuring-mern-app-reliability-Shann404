// middleware/validation.js
const Joi = require('joi');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Replace query with validated values
    req.query = value;
    next();
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery
};