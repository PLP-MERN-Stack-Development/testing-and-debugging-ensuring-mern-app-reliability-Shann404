import React, { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      className={`theme-toggle ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;