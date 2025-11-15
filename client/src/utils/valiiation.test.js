// client/src/tests/utils/validation.test.js
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePostTitle,
  validatePostContent,
  sanitizeInput,
  validateForm
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user@sub.domain.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid@.com'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    test('should validate password strength', () => {
      const testCases = [
        { password: '123', expected: false, reason: 'Too short' },
        { password: 'password', expected: false, reason: 'No numbers or special chars' },
        { password: 'Password123', expected: true, reason: 'Has uppercase, lowercase, numbers' },
        { password: 'Pass123!', expected: true, reason: 'Has special characters' },
        { password: 'A'.repeat(65), expected: false, reason: 'Too long' }
      ];

      testCases.forEach(({ password, expected, reason }) => {
        expect(validatePassword(password)).toBe(expected);
      });
    });
  });

  describe('Input Sanitization', () => {
    test('should remove harmful HTML tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Safe text';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe text');
    });

    test('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    test('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });

  describe('Form Validation', () => {
    test('should validate complete form data', () => {
      const validForm = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      };

      const invalidForm = {
        name: '',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456'
      };

      expect(validateForm(validForm, 'register')).toEqual({ isValid: true, errors: {} });
      
      const result = validateForm(invalidForm, 'register');
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });
});