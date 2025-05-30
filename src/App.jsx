import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { 
  Sidebar, 
  ChatInterface, 
  UrlAnalyzer, 
  FileUploader, 
  WcagGuide 
} from './components';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import { FaBars, FaTimes } from 'react-icons/fa';
import './App.css';

// Componente para renderizar o conteúdo dinâmico
const ContentRenderer = ({ activeTool }) => {
  const contentMap = {
    chat: <ChatInterface />,
    url: <UrlAnalyzer />,
    upload: <FileUploader />,
    guide: <WcagGuide />
  };

  const titleMap = {
    chat: 'Chat Assistente',
    url: 'Análise de URL',
    upload: 'Upload de Arquivo',
    guide: 'Guia WCAG'
  };

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="content-title">{titleMap[activeTool]}</h1>
      </div>
      <div className="content-body">
        {contentMap[activeTool] || contentMap.chat}
      </div>
    </div>
  );
};

// Componente principal App
function App() {
  // Estado para a ferramenta ativa
  const [activeTool, setActiveTool] = useState('chat');
  
  // Estado para controlar a visibilidade da sidebar em dispositivos móveis
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Detectar dispositivos móveis e ajustar a sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    // Adicionar listener de resize
    window.addEventListener('resize', handleResize);
    
    // Remover listener no cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para alternar a sidebar em dispositivos móveis
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <ThemeProvider>
      <div className="app">

        {/* Header Principal */}
        <header className="app-header">
          <div className="header-container">
            {/* Logo e Título */}
            <div className="brand">
              <h1 className="brand-title">ISA</h1>
              <span className="brand-subtitle">Inteligência Simulada de Acessibilidade</span>
            </div>

            {/* Controles do Header */}
            <div className="header-controls">
              <ThemeToggle />
              {isMobile && (
                <button
                  className="menu-toggle"
                  onClick={toggleSidebar}
                  aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
                  aria-expanded={sidebarOpen}
                >
                  {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Layout Principal */}
        <div className="app-layout">
          {/* Sidebar de Navegação */}
          <aside className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
            <Sidebar 
              activeTool={activeTool} 
              setActiveTool={(tool) => {
                setActiveTool(tool);
                if (isMobile) setSidebarOpen(false);
              }}
            />
          </aside>

          {/* Overlay para Mobile */}
          {isMobile && sidebarOpen && (
            <div 
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Área de Conteúdo Principal */}
          <main 
            id="main-content" 
            className={`main-container ${sidebarOpen && !isMobile ? 'with-sidebar' : ''}`}
          >
            <ContentRenderer activeTool={activeTool} />
          </main>
        </div>

        {/* Rodapé */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;