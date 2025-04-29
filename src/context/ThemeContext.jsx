// src/context/ThemeContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

// Modern color themes
const themes = {
  light: {
    primary: '#6366f1', // Indigo
    primaryLight: '#a5b4fc',
    primaryDark: '#4f46e5',
    secondary: '#f43f5e', // Rose
    secondaryLight: '#fda4af',
    secondaryDark: '#e11d48',
    accent: '#10b981', // Emerald
    background: '#ffffff',
    backgroundAlt: '#f9fafb',
    backgroundSecondary: '#f3f4f6',
    text: '#111827',
    textLight: '#4b5563',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  dark: {
    primary: '#818cf8', // Indigo
    primaryLight: '#c7d2fe',
    primaryDark: '#4f46e5',
    secondary: '#fb7185', // Rose
    secondaryLight: '#fda4af',
    secondaryDark: '#e11d48',
    accent: '#34d399', // Emerald
    background: '#111827',
    backgroundAlt: '#1f2937',
    backgroundSecondary: '#374151',
    text: '#f9fafb',
    textLight: '#e5e7eb',
    textSecondary: '#d1d5db',
    border: '#4b5563',
    error: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#60a5fa',
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme effect
  useEffect(() => {
    // Toggle dark class on root element
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Apply CSS variables for current theme
    const currentTheme = darkMode ? themes.dark : themes.light;
    Object.entries(currentTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Set theme-color meta tag for mobile browsers
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.background);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = currentTheme.background;
      document.head.appendChild(meta);
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleTheme,
      setTheme: (mode) => setDarkMode(mode === 'dark'),
      currentTheme: darkMode ? themes.dark : themes.light,
      themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};