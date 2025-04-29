// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';

function ThemeToggle({ showLabel = false, className = '' }) {
  const { darkMode, toggleTheme, setTheme } = useTheme();
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
  
  // Handle keyboard navigation
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'toggle') {
        setIsOpen(!isOpen);
      } else if (action === 'light') {
        setTheme('light');
        setIsOpen(false);
      } else if (action === 'dark') {
        setTheme('dark');
        setIsOpen(false);
      } else if (action === 'system') {
        // Reset to system preference
        localStorage.removeItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const focusableItems = document.querySelectorAll('.theme-option');
      const currentIndex = Array.from(focusableItems).findIndex(item => item === document.activeElement);
      const nextIndex = (currentIndex + 1) % focusableItems.length;
      focusableItems[nextIndex].focus();
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const focusableItems = document.querySelectorAll('.theme-option');
      const currentIndex = Array.from(focusableItems).findIndex(item => item === document.activeElement);
      const prevIndex = (currentIndex - 1 + focusableItems.length) % focusableItems.length;
      focusableItems[prevIndex].focus();
    }
  };

  return (
    <div className={`theme-toggle-container relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e, 'toggle')}
        className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
          darkMode
            ? 'text-primary hover:bg-background-alt'
            : 'text-primary hover:bg-background-secondary'
        }`}
        aria-label={darkMode ? "Alterar tema, atual: escuro" : "Alterar tema, atual: claro"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {darkMode ? <FaMoon size={18} /> : <FaSun size={18} />}
        {showLabel && <span>{darkMode ? 'Escuro' : 'Claro'}</span>}
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-1 p-2 rounded-lg shadow-lg bg-background border border-border glass z-50 min-w-[200px]"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            <button
              className={`theme-option flex items-center gap-3 w-full p-2 rounded-md transition-colors text-left ${
                !darkMode ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-background-secondary'
              }`}
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              onKeyDown={(e) => handleKeyDown(e, 'light')}
              role="menuitem"
              aria-current={!darkMode}
            >
              <FaSun size={16} />
              <span>Modo Claro</span>
            </button>
            
            <button
              className={`theme-option flex items-center gap-3 w-full p-2 rounded-md transition-colors text-left ${
                darkMode ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-background-secondary'
              }`}
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              onKeyDown={(e) => handleKeyDown(e, 'dark')}
              role="menuitem"
              aria-current={darkMode}
            >
              <FaMoon size={16} />
              <span>Modo Escuro</span>
            </button>
            
            <button
              className="theme-option flex items-center gap-3 w-full p-2 rounded-md transition-colors hover:bg-background-secondary text-left"
              onClick={() => {
                // Reset to system preference
                localStorage.removeItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(systemPrefersDark ? 'dark' : 'light');
                setIsOpen(false);
              }}
              onKeyDown={(e) => handleKeyDown(e, 'system')}
              role="menuitem"
            >
              <FaDesktop size={16} />
              <span>Preferência do Sistema</span>
            </button>
          </div>
          
          <div className="pt-2 mt-2 border-t border-border">
            <p className="text-xs text-text-secondary px-2">
              Acessibilidade: Escolha o tema de acordo com suas necessidades visuais ou preferências.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;