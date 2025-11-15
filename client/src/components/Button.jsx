import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  // Use class names that match your tests
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = disabled ? 'btn-disabled' : '';

  const buttonClass = `${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;