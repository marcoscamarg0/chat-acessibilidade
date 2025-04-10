// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import UrlAnalyzer from './components/UrlAnalyzer';
import FileUploader from './components/FileUploader';
import WcagGuide from './components/WcagGuide';

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [activeTool, setActiveTool] = useState('chat');


  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Aplicar tema ao carregar
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]); // Adiciona darkMode como dependência

  // Renderiza o componente ativo
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'chat':
        return <ChatInterface darkMode={darkMode} />;
      case 'url':
        return <UrlAnalyzer darkMode={darkMode} />;
      case 'upload':
        return <FileUploader darkMode={darkMode} />;
      case 'guide':
        return <WcagGuide darkMode={darkMode} />;
      default:
        return <ChatInterface darkMode={darkMode} />;
    }
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'dark' : ''}`}>
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
      />
      
      <main className="flex-1 flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
        <header className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            Assistente de Acessibilidade
          </h1>
        </header>
        
        <div className="flex-1 overflow-auto">
          {renderActiveTool()}
        </div>
      </main>
    </div>
  );
}

export default App;