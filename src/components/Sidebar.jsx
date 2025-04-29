// src/components/Sidebar.jsx
import { useTheme } from '../context/ThemeContext';

function Sidebar({ activeTool, setActiveTool }) {
  const { darkMode, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'chat', label: 'Chat', icon: '💬', ariaLabel: 'Chat com assistente' },
    { id: 'url', label: 'Analisar URL', icon: '🔗', ariaLabel: 'Analisar acessibilidade de URL' },
    { id: 'upload', label: 'Upload de HTML', icon: '📄', ariaLabel: 'Analisar arquivo HTML' },
    { id: 'guide', label: 'Guia WCAG', icon: '📚', ariaLabel: 'Consultar guia WCAG' },
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e, itemId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTool(itemId);
    }
  };

  return (
    <nav className="h-full flex flex-col" aria-label="Menu principal">
      <div className="p-4 flex items-center space-x-2">
        <div className="text-blue-600 dark:text-blue-400 text-2xl" aria-hidden="true">♿</div>
        <span className="text-blue-600 dark:text-blue-400 font-bold">AssistAcess</span>
      </div>
      
      <div className="px-2 py-4 flex-1">
        <div className="flex items-center justify-between px-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Modo {darkMode ? 'Escuro' : 'Claro'}
          </p>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div role="menu" aria-label="Ferramentas disponíveis">
          {menuItems.map(item => (
            <div 
              key={item.id}
              role="menuitem"
              tabIndex={0}
              className={`p-3 my-1 rounded cursor-pointer flex items-center space-x-2 ${
                activeTool === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onClick={() => setActiveTool(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              aria-label={item.ariaLabel}
              aria-current={activeTool === item.id ? 'page' : undefined}
            >
              <div className="text-lg" aria-hidden="true">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span>Desenvolvido com ❤️</span>
          <span>© 2025 AssistAcess</span>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;