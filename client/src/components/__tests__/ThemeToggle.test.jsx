import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';

// Mock the context - require React inside the factory
jest.mock('../../contexts/ThemeContext', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.createContext({
      theme: 'light',
      toggleTheme: jest.fn(),
    }),
  };
});

describe('ThemeToggle Component', () => {
  const mockToggleTheme = jest.fn();

  // Create a test wrapper that provides the context
  const renderWithTheme = (theme = 'light') => {
    const ThemeContext = require('../../contexts/ThemeContext').default;
    
    return render(
      <ThemeContext.Provider value={{ theme, toggleTheme: mockToggleTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>
    );
  };

  beforeEach(() => {
    mockToggleTheme.mockClear();
  });

  it('should render with light theme icon', () => {
    renderWithTheme('light');

    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('should render with dark theme icon', () => {
    renderWithTheme('dark');

    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('should call toggleTheme when clicked', () => {
    renderWithTheme('light');

    const toggleButton = screen.getByText('🌙');
    fireEvent.click(toggleButton);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});