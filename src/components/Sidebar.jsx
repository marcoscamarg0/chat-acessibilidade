// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaComments, FaLink, FaFileCode, FaBook, FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';

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
      className={`h-full flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'} glass`} 
      aria-label="Menu principal"
    >
      <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center">
            <div className="text-primary text-2xl mr-2" aria-hidden="true">♿</div>
            <span className="gradient-text font-bold text-lg">AssistAcess</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-background-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <FaArrowLeft className={`text-primary transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className="px-2 py-4 flex-1 overflow-auto">
        <div role="menu" aria-label="Ferramentas disponíveis">
          {menuItems.map(item => (
            <div 
              key={item.id}
              role="menuitem"
              tabIndex={0}
              className={`my-2 rounded-lg flex items-center cursor-pointer transition-all ${
                collapsed ? 'justify-center p-3' : 'p-3'
              } ${
                activeTool === item.id 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-background-secondary text-text'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
              onClick={() => setActiveTool(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              aria-label={item.ariaLabel}
              aria-current={activeTool === item.id ? 'page' : undefined}
            >
              <div className={`${activeTool === item.id ? 'text-white' : 'text-primary'}`}>
                {item.icon}
              </div>
              
              {!collapsed && (
                <span className={`ml-3 transition-opacity duration-200 ${
                  collapsed ? 'opacity-0 w-0' : 'opacity-100'
                }`}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={`p-3 border-t border-border ${collapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-background-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center"
          aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {darkMode ? (
            <>
              <FaSun className="text-secondary" />
              {!collapsed && <span className="ml-2">Modo Claro</span>}
            </>
          ) : (
            <>
              <FaMoon className="text-primary" />
              {!collapsed && <span className="ml-2">Modo Escuro</span>}
            </>
          )}
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;