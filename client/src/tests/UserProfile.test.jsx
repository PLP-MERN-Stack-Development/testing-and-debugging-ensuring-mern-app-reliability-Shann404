import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from '../UserProfile';

// Mock all dependencies
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../utils/formatters', () => ({
  formatDate: jest.fn((date) => `Formatted: ${date}`),
}));

// Mock CSS imports
jest.mock('../UserProfile.css', () => ({}));

const { apiClient } = require('../utils/apiClient');
const { formatDate } = require('../utils/formatters');

describe('UserProfile Component', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01',
    avatar: 'avatar.jpg',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<UserProfile userId={1} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render user data after successful fetch', async () => {
    apiClient.get.mockResolvedValue(mockUser);
    formatDate.mockReturnValue('January 1, 2023');

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Member since: Formatted: 2023-01-01')).toBeInTheDocument();
    expect(screen.getByAltText("John Doe's avatar")).toHaveAttribute('src', 'avatar.jpg');
    
    // Verify API was called correctly
    expect(apiClient.get).toHaveBeenCalledWith('/users/1');
    expect(formatDate).toHaveBeenCalledWith('2023-01-01');
  });

  it('should render error state when API fails', async () => {
    apiClient.get.mockRejectedValue(new Error('User not found'));

    render(<UserProfile userId={999} />);

    await waitFor(() => {
      expect(screen.getByText('Error: User not found')).toBeInTheDocument();
    });
  });

  it('should render not found when user data is empty', async () => {
    apiClient.get.mockResolvedValue(null);

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});