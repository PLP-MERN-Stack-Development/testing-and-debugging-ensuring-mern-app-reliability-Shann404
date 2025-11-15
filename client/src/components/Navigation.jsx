import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getFromStorage } from '../utils/storage';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!getFromStorage('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Home
      </Link>
      <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
        About
      </Link>
      
      {isLoggedIn ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navigation;