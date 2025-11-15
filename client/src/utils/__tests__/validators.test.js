import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateForm
} from '../validators';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123!')).toEqual({ isValid: true, errors: [] });
    });

    it('should identify weak passwords with specific errors', () => {
      const result = validatePassword('weak');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });
  });

  describe('validatePhone', () => {
  it('should validate phone numbers', () => {
    expect(validatePhone('+15551234567')).toBe(true);
    expect(validatePhone('5551234567')).toBe(true);
    expect(validatePhone('555-123-4567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false); // Too short
    expect(validatePhone('abc-def-ghij')).toBe(false); // Contains letters
    expect(validatePhone('555-123-456')).toBe(false); // Too short (9 digits)
  });
});

  describe('validateForm', () => {
    it('should validate complete form data', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };

      const rules = {
        name: validateRequired,
        email: validateEmail,
        password: validatePassword
      };

      const result = validateForm(formData, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should collect validation errors', () => {
      const formData = {
        name: '',
        email: 'invalid',
        password: 'weak'
      };

      const rules = {
        name: validateRequired,
        email: validateEmail,
        password: validatePassword
      };

      const result = validateForm(formData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });
});