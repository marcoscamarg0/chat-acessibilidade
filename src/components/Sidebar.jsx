import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  FaComments, 
  FaGlobe, 
  FaUpload, 
  FaBook,
  FaRobot,
  FaChevronRight
} from 'react-icons/fa';
import './styles/Sidebar.css';

const Sidebar = ({ activeTool, setActiveTool }) => {
  const { darkMode } = useTheme();

  const menuItems = [
    {
      id: 'chat',
      label: 'Chat Assistente',
      description: 'Converse com o assistente de acessibilidade',
      icon: FaComments,
      color: '#3b82f6'
    },
    {
      id: 'url',
      label: 'Analisar URL',
      description: 'Analise a acessibilidade de um site',
      icon: FaGlobe,
      color: '#10b981'
    },
    {
      id: 'upload',
      label: 'Upload HTML',
      description: 'Envie arquivos para análise',
      icon: FaUpload,
      color: '#f59e0b'
    },
    {
      id: 'guide',
      label: 'Guia WCAG',
      description: 'Consulte as diretrizes de acessibilidade',
      icon: FaBook,
      color: '#8b5cf6'
    }
  ];

  return (
    <nav className={`sidebar ${darkMode ? 'dark' : ''}`} role="navigation" aria-label="Menu principal">
      {/* Header da Sidebar */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <FaRobot className="sidebar-brand-icon" />
          <div className="sidebar-brand-text">
            <h2>ISA</h2>
            <span>Ferramentas</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        <div className="menu-section">
          <h3 className="menu-section-title">Ferramentas</h3>
          <ul className="menu-list" role="list">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTool === item.id;
              
              return (
                <li key={item.id} role="listitem">
                  <button
                    onClick={() => setActiveTool(item.id)}
                    className={`menu-item ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.description}
                  >
                    <div className="menu-item-icon" style={{ color: item.color }}>
                      <IconComponent size={20} />
                    </div>
                    <div className="menu-item-content">
                      <span className="menu-item-label">{item.label}</span>
                      <span className="menu-item-description">{item.description}</span>
                    </div>
                    <div className="menu-item-arrow">
                      <FaChevronRight size={12} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer da Sidebar */}
      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p className="sidebar-version">v1.0.0</p>
          <p className="sidebar-copyright">© 2025 ISA - Inteligência Simulada de Acessibilidade</p>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;