import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(buttonElement);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeDisabled();
  });

  test('has correct type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const buttonElement = screen.getByRole('button', { name: /submit/i });
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const buttonElement = screen.getByRole('button', { name: /custom/i });
    expect(buttonElement).toHaveClass('custom-class');
  });
});