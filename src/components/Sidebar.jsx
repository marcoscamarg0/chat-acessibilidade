// src/components/Sidebar.jsx
function Sidebar({ activeTool, setActiveTool, darkMode, toggleTheme }) {
  const menuItems = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'url', label: 'Analisar URL', icon: '🔗' },
    { id: 'upload', label: 'Upload de HTML', icon: '📄' },
    { id: 'guide', label: 'Guia WCAG', icon: '📚' },
  ];

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-4 flex items-center space-x-2">
        <div className="text-blue-600 dark:text-blue-400 text-2xl">♿</div>
        <span className="text-blue-600 dark:text-blue-400 font-bold">AssistAcess</span>
      </div>
      
      <div className="px-2 py-4">
        <div className="flex items-center justify-between px-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Modo {darkMode ? 'Escuro' : 'Claro'}
          </p>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {menuItems.map(item => (
          <div 
            key={item.id}
            className={`p-3 my-1 rounded cursor-pointer flex items-center space-x-2 ${
              activeTool === item.id 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            } transition-colors duration-200`}
            onClick={() => setActiveTool(item.id)}
          >
            <div className="text-lg">{item.icon}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-0 w-64 p-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span>Desenvolvido com ❤️</span>
          <span>© 2025 AssistAcess</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;