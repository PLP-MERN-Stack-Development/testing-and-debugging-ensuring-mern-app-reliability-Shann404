// src/components/UserList/UserList.jsx
import React, { useState, useEffect } from 'react';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-list">
      <h2>User Management</h2>
      <button onClick={fetchUsers} className="refresh-btn">
        Refresh Users
      </button>
      
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card" data-testid="user-card">
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <div className="user-actions">
              <button 
                onClick={() => deleteUser(user.id)}
                className="delete-btn"
                aria-label={`Delete user ${user.name}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && !loading && (
        <div className="no-users">No users found</div>
      )}
    </div>
  );
};

export default UserList;