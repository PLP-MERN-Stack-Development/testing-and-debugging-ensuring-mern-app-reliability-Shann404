// client/src/tests/components/FormValidation.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';
import PostForm from '../components/PostForm';

// Mock API calls
jest.mock('../../services/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  createPost: jest.fn(),
}));

describe('Client-Side Form Validation', () => {
  const user = userEvent.setup();

  describe('Login Form Validation', () => {
    test('should show validation errors for empty fields', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    test('should validate email format', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    test('should clear errors when user starts typing', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });

    test('should disable submit button during submission', async () => {
      const { login } = require('../../services/api');
      login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/logging in/i);
    });
  });

  describe('Registration Form Validation', () => {
    test('should validate password strength', async () => {
      render(<RegistrationForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      // Test weak password
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();

      // Test strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongPassword123!');
      
      expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument();
    });

    test('should validate password confirmation', async () => {
      render(<RegistrationForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    });

    test('should validate name field', async () => {
      render(<RegistrationForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      // Test empty name
      await user.click(submitButton);
      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();

      // Test very long name
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(256));
      expect(await screen.findByText(/name must be less than 255 characters/i)).toBeInTheDocument();
    });
  });

  describe('Post Form Validation', () => {
    test('should validate post title and content', async () => {
      render(<PostForm />);

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/content is required/i)).toBeInTheDocument();
    });

    test('should validate minimum content length', async () => {
      render(<PostForm />);

      const titleInput = screen.getByLabelText(/title/i);
      const contentInput = screen.getByLabelText(/content/i);
      const submitButton = screen.getByRole('button', { name: /create post/i });

      await user.type(titleInput, 'Test Title');
      await user.type(contentInput, 'Short');
      await user.click(submitButton);

      expect(await screen.findByText(/content must be at least 10 characters/i)).toBeInTheDocument();
    });

    test('should show character count for content', async () => {
      render(<PostForm />);

      const contentInput = screen.getByLabelText(/content/i);
      await user.type(contentInput, 'This is a test content');

      expect(screen.getByText(/22\/5000 characters/i)).toBeInTheDocument();
    });
  });

  describe('Real-time Validation', () => {
    test('should validate email in real-time', async () => {
      render(<RegistrationForm />);

      const emailInput = screen.getByLabelText(/email/i);

      // Type invalid email
      await user.type(emailInput, 'invalid');
      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();

      // Fix the email
      await user.type(emailInput, '@example.com');
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });

    test('should show password strength meter', async () => {
      render(<RegistrationForm />);

      const passwordInput = screen.getByLabelText(/password/i);

      // Weak password
      await user.type(passwordInput, '123');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      // Strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongPass123!');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission States', () => {
    test('should show loading state during submission', async () => {
      const { register } = require('../../services/api');
      register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegistrationForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/registering/i);
    });

    test('should show success message after submission', async () => {
      const { register } = require('../../services/api');
      register.mockResolvedValue({ success: true });

      render(<RegistrationForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(await screen.findByText(/registration successful/i)).toBeInTheDocument();
    });

    test('should show error message on submission failure', async () => {
      const { register } = require('../../services/api');
      register.mockRejectedValue(new Error('Email already exists'));

      render(<RegistrationForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});