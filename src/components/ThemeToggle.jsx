import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={18} className="fill-current" />
      ) : (
        <Sun size={18} className="fill-current" />
      )}
    </button>
  );
};

export default ThemeToggle;
