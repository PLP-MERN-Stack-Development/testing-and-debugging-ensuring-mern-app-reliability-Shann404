export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters except + at the beginning
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it's a valid phone number format
  const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/; // 10-15 digits, optional + at start
  
  return phoneRegex.test(cleaned);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const validator = rules[field];
    
    if (typeof validator === 'function') {
      const result = validator(value);
      
      if (typeof result === 'boolean') {
        if (!result) {
          errors[field] = `${field} is invalid`;
          isValid = false;
        }
      } else if (result && typeof result === 'object' && !result.isValid) {
        errors[field] = result.errors.join(', ');
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};