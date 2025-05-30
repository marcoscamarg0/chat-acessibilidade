// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaComments, FaLink, FaFileCode, FaBook, FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';
import './styles/Sidebar.css';

function Sidebar({ activeTool, setActiveTool }) {
  const { darkMode, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: <FaComments size={18} />, 
      ariaLabel: 'Chat com assistente' 
    },
    { 
      id: 'url', 
      label: 'Analisar URL', 
      icon: <FaLink size={18} />, 
      ariaLabel: 'Analisar acessibilidade de URL' 
    },
    { 
      id: 'upload', 
      label: 'Upload de HTML', 
      icon: <FaFileCode size={18} />, 
      ariaLabel: 'Analisar arquivo HTML' 
    },
    { 
      id: 'guide', 
      label: 'Guia WCAG', 
      icon: <FaBook size={18} />, 
      ariaLabel: 'Consultar guia WCAG' 
    },
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e, itemId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTool(itemId);
    }
  };

  return (
    <nav 
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${darkMode ? 'sidebar--dark' : 'sidebar--light'}`}
      aria-label="Menu principal"
    >
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <div className="sidebar__brand-icon" aria-hidden="true">♿</div>
            <span className="sidebar__brand-text">AssistAcess</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar__toggle"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <FaArrowLeft className={`sidebar__toggle-icon ${collapsed ? 'sidebar__toggle-icon--rotated' : ''}`} />
        </button>
      </div>
      
      <div className="sidebar__content">
        <div role="menu" aria-label="Ferramentas disponíveis">
          {menuItems.map(item => (
            <div 
              key={item.id}
              role="menuitem"
              tabIndex={0}
              className={`sidebar__item ${activeTool === item.id ? 'sidebar__item--active' : ''}`}
              onClick={() => setActiveTool(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              aria-label={item.ariaLabel}
              aria-current={activeTool === item.id ? 'page' : undefined}
            >
              <div className="sidebar__item-icon">
                {item.icon}
              </div>
              
              {!collapsed && (
                <span className="sidebar__item-label">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar__footer">
        <button 
          onClick={toggleTheme} 
          className="sidebar__theme-toggle"
          aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {darkMode ? (
            <>
              <FaSun className="sidebar__theme-icon" />
              {!collapsed && <span className="sidebar__theme-label">Modo Claro</span>}
            </>
          ) : (
            <>
              <FaMoon className="sidebar__theme-icon" />
              {!collapsed && <span className="sidebar__theme-label">Modo Escuro</span>}
            </>
          )}
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;