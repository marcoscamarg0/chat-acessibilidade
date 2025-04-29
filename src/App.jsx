// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import UrlAnalyzer from './components/UrlAnalyzer';
import FileUploader from './components/FileUploader';
import WcagGuide from './components/WcagGuide';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FaBars, FaTimes, FaAccessibleIcon } from 'react-icons/fa';

function App() {
  const [activeTool, setActiveTool] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Detect mobile devices and close sidebar automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check on mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar (for mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <AppContent 
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    </ThemeProvider>
  );
}

// Separate component to use the ThemeContext
function AppContent({ 
  activeTool, 
  setActiveTool, 
  sidebarOpen, 
  toggleSidebar 
}) {
  const { darkMode } = useTheme();
  
  // Render active component
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'chat':
        return <ChatInterface />;
      case 'url':
        return <UrlAnalyzer />;
      case 'upload':
        return <FileUploader />;
      case 'guide':
        return <WcagGuide />;
      default:
        return <ChatInterface />;
    }
  };
  
  return (
    <div className={`h-screen flex flex-col md:flex-row ${darkMode ? 'dark' : ''}`}>
      {/* Skip to content link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-20 p-3 rounded-full bg-primary text-white shadow-lg"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>
      
      {/* Sidebar with responsive behavior */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:relative left-0 top-0 bottom-0 z-10
        md:h-screen
      `}>
        <Sidebar 
          activeTool={activeTool} 
          setActiveTool={(tool) => {
            setActiveTool(tool);
            // Close sidebar after selection on mobile
            if (window.innerWidth < 768) {
              toggleSidebar();
            }
          }}
        />
      </div>
      
      <main 
        id="main-content" 
        className="flex-1 flex flex-col w-full md:w-auto transition-all duration-300 ease-in-out"
      >
        <header className="bg-background-alt dark:bg-background-alt p-4 border-b border-border glass">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center">
              <FaAccessibleIcon className="text-secondary mr-2" />
              <span className="gradient-text">Assistente de Acessibilidade</span>
            </h1>
            
            <div className="flex items-center space-x-2">
              <div className="badge badge-primary">
                WCAG 2.1
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 transition-all">
          <div className="card p-4 h-full">
            {renderActiveTool()}
          </div>
        </div>
        
        <footer className="text-center py-3 text-xs text-text-secondary border-t border-border">
          <p>AssistAcess © 2025 · Desenvolvido para melhorar a acessibilidade web</p>
        </footer>
      </main>
    </div>
  );
}


export default App;