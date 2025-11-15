// src/components/UserForm/UserForm.jsx
import React, { useState } from 'react';
import './UserForm.css';

const UserForm = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('User created successfully!');
        setFormData({ name: '', email: '', role: 'user' });
        if (onUserCreated) {
          onUserCreated(result.data);
        }
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form" data-testid="user-form">
      <h3>Create New User</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          data-testid="name-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="email-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="role">Role:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          data-testid="role-select"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="submit-btn"
        data-testid="submit-button"
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};

export default UserForm;