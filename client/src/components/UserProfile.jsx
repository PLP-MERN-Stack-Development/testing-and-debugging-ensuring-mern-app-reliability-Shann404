import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { formatDate } from '../utils/formatters';
import './UserProfile.css';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await apiClient.get(`/users/${userId}`);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!user) return <div className="not-found">User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Member since: {formatDate(user.createdAt)}</p>
      <img src={user.avatar} alt={`${user.name}'s avatar`} />
    </div>
  );
};

export default UserProfile;