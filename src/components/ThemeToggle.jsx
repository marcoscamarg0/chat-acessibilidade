// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaDesktop, FaCog } from 'react-icons/fa'; // Added FaCog for consistency if needed
import './styles/ThemeToggle.css'; // Import the new CSS file

function ThemeToggle({ showLabel = false, className = '' }) {
  const { darkMode, setTheme } = useTheme(); // Removed toggleTheme as setTheme offers more control
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.theme-toggle-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleThemeSelection = (newTheme) => {
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setTheme(newTheme);
    }
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, action, param = null) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'toggle') {
        setIsOpen(!isOpen);
      } else if (action === 'selectTheme') {
        handleThemeSelection(param);
      }
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      // Optionally, return focus to the toggle button
      e.currentTarget.closest('.theme-toggle-container').querySelector('.theme-toggle-button').focus();
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const focusableItems = Array.from(e.currentTarget.querySelectorAll('.theme-option'));
      const currentIndex = focusableItems.findIndex(item => item === document.activeElement);
      const nextIndex = (currentIndex + 1) % focusableItems.length;
      focusableItems[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const focusableItems = Array.from(e.currentTarget.querySelectorAll('.theme-option'));
      const currentIndex = focusableItems.findIndex(item => item === document.activeElement);
      const prevIndex = (currentIndex - 1 + focusableItems.length) % focusableItems.length;
      focusableItems[prevIndex]?.focus();
    }
  };

  const currentThemeIcon = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') return <FaSun size={18} />;
    if (storedTheme === 'dark') return <FaMoon size={18} />;
    // If 'system' or not set, determine by darkMode which reflects system or last explicit choice
    return darkMode ? <FaMoon size={18} /> : <FaSun size={18} />;
  };


  return (
    <div className={`theme-toggle-container ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e, 'toggle')}
        className="theme-toggle-button"
        aria-label={darkMode ? "Alterar tema, tema atual: Escuro" : "Alterar tema, tema atual: Claro"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Alterar tema"
      >
        {/* The icon in the button should reflect the active theme,
            or a generic settings icon if preferred.
            Using Sun/Moon based on darkMode for direct feedback. */}
        {darkMode ? <FaMoon size={18} /> : <FaSun size={18} />}
        {showLabel && <span>{darkMode ? 'Escuro' : 'Claro'}</span>}
      </button>
      
      {isOpen && (
        <div 
          className="theme-dropdown-menu"
          role="menu"
          aria-orientation="vertical"
          onKeyDown={(e) => handleKeyDown(e, null)} // To handle Escape, ArrowUp, ArrowDown within the menu
        >
          <div className="theme-options-list">
            <button
              className={`theme-option ${!darkMode && localStorage.getItem('theme') === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeSelection('light')}
              onKeyDown={(e) => handleKeyDown(e, 'selectTheme', 'light')}
              role="menuitemradio"
              aria-checked={!darkMode && localStorage.getItem('theme') === 'light'}
            >
              <FaSun size={16} />
              <span>Modo Claro</span>
            </button>
            
            <button
              className={`theme-option ${darkMode && localStorage.getItem('theme') === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeSelection('dark')}
              onKeyDown={(e) => handleKeyDown(e, 'selectTheme', 'dark')}
              role="menuitemradio"
              aria-checked={darkMode && localStorage.getItem('theme') === 'dark'}
            >
              <FaMoon size={16} />
              <span>Modo Escuro</span>
            </button>
            
            <button
              className={`theme-option ${!localStorage.getItem('theme') ? 'active' : ''}`}
              onClick={() => handleThemeSelection('system')}
              onKeyDown={(e) => handleKeyDown(e, 'selectTheme', 'system')}
              role="menuitemradio"
              aria-checked={!localStorage.getItem('theme')}
            >
              <FaDesktop size={16} />
              <span>Preferência do Sistema</span>
            </button>
          </div>
          
          <div className="theme-dropdown-footer">
            <p>
              Acessibilidade: Escolha o tema de acordo com suas necessidades visuais ou preferências.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;