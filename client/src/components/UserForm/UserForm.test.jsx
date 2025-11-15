// src/components/UserForm/UserForm.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../mocks/server';
import UserForm from './UserForm';

describe('UserForm Component Integration Tests', () => {
  const user = userEvent.setup();

  test('should submit form and create user successfully', async () => {
    const mockOnUserCreated = jest.fn();
    
    render(<UserForm onUserCreated={mockOnUserCreated} />);

    // Fill out the form
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.selectOptions(screen.getByTestId('role-select'), 'admin');

    // Submit the form
    await user.click(screen.getByTestId('submit-button'));

    // Verify loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('User created successfully!')).toBeInTheDocument();
    });

    // Verify form is reset
    expect(screen.getByTestId('name-input')).toHaveValue('');
    expect(screen.getByTestId('email-input')).toHaveValue('');
    expect(screen.getByTestId('role-select')).toHaveValue('user');

    // Verify callback was called
    expect(mockOnUserCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      })
    );
  });

  test('should display validation errors from API', async () => {
    // Override handler to return validation error
    server.use(
      rest.post('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ success: false, error: 'Name and email are required' })
        );
      })
    );

    render(<UserForm />);

    // Submit form without filling required fields
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Name and email are required')).toBeInTheDocument();
    });
  });

  test('should handle network errors', async () => {
    // Override handler to simulate network error
    server.use(
      rest.post('/api/users', (req, res) => {
        return res.networkError('Failed to connect');
      })
    );

    render(<UserForm />);

    // Fill and submit form
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  test('should disable submit button while loading', async () => {
    render(<UserForm />);

    const submitButton = screen.getByTestId('submit-button');

    // Fill form
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');

    // Submit and verify button is disabled
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Creating...');

    // Wait for request to complete and verify button is enabled again
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
    expect(submitButton).toHaveTextContent('Create User');
  });
});