// src/components/UserList/UserList.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../mocks/server';
import UserList from './UserList';

describe('UserList Component Integration Tests', () => {
  const user = userEvent.setup();

  test('should fetch and display users on component mount', async () => {
    render(<UserList />);

    // Should show loading state initially
    expect(screen.getByText('Loading users...')).toBeInTheDocument();

    // Wait for users to load and verify they are displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    // Verify user cards are rendered
    const userCards = screen.getAllByTestId('user-card');
    expect(userCards).toHaveLength(2);
  });

  test('should handle API error when fetching users', async () => {
    // Override the default handler for this test
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ success: false, error: 'Internal server error' })
        );
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Error: Internal server error')).toBeInTheDocument();
    });
  });

  test('should refresh users when refresh button is clicked', async () => {
    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Mock a different response for the refresh
    let callCount = 0;
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        callCount++;
        if (callCount === 1) {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              data: [
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' }
              ]
            })
          );
        } else {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              data: [
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
                { id: 3, name: 'New User', email: 'new@example.com', role: 'user' }
              ]
            })
          );
        }
      })
    );

    // Click refresh button
    const refreshButton = screen.getByText('Refresh Users');
    await user.click(refreshButton);

    // Verify new user appears
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });

  test('should delete user when delete button is clicked', async () => {
    // Mock window.confirm
    window.confirm = jest.fn().mockImplementation(() => true);

    render(<UserList />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button for John Doe
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Verify user is removed from the list
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    // Verify only Jane Smith remains
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
  });

  test('should not delete user when confirmation is cancelled', async () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockImplementation(() => false);

    render(<UserList />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Verify user is still in the list
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalled();
  });
});