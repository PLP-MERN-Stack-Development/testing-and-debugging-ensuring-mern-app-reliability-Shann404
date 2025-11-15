import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '../Navigation';

// Mock React Router with simpler implementation
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
  Link: ({ children, to, className, ...props }) => (
    <a href={to} className={className} {...props}>{children}</a>
  ),
}));

// Mock storage utility
jest.mock('../../utils/storage', () => ({
  getFromStorage: jest.fn(),
}));

const { useLocation, useNavigate } = require('react-router-dom');
const { getFromStorage } = require('../../utils/storage');

describe('Navigation Component', () => {
  const mockNavigate = jest.fn();
  const mockLocation = { pathname: '/' };

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
    jest.clearAllMocks();
  });

  it('should render navigation links for logged out user', () => {
    getFromStorage.mockReturnValue(null); // Not logged in

    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should render navigation links for logged in user', () => {
    getFromStorage.mockReturnValue('fake-token'); // Logged in

    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should handle logout', () => {
    getFromStorage.mockReturnValue('fake-token');
    const removeItemMock = jest.spyOn(Storage.prototype, 'removeItem');

    render(<Navigation />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(removeItemMock).toHaveBeenCalledWith('authToken');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    
    removeItemMock.mockRestore();
  });
});