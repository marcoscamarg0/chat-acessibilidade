import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { 
  Sidebar, 
  ChatInterface, 
  UrlAnalyzer, 
  FileUploader, 
  WcagGuide 
} from './components';

// Componente para renderizar o conteúdo dinâmico
const ContentRenderer = ({ activeTool }) => {
  const contentMap = {
    chat: <ChatInterface />,
    url: <UrlAnalyzer />,
    upload: <FileUploader />,
    guide: <WcagGuide />
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="gradient-text">
          {
            {
              chat: 'Assistente de Acessibilidade',
              url: 'Analisar URL',
              upload: 'Upload de HTML',
              guide: 'Guia WCAG'
            }[activeTool]
          }
        </h1>
      </div>
      {contentMap[activeTool] || contentMap.chat}
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
      
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Adicionar listener de resize
    window.addEventListener('resize', handleResize);
    
    // Remover listener no cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para alternar a sidebar em dispositivos móveis
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Link de acessibilidade para pular navegação */}
      

      {/* Botão de menu para dispositivos móveis */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? '✖' : '☰'}
        </button>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar 
          activeTool={activeTool} 
          setActiveTool={(tool) => {
            setActiveTool(tool);
            
            // Fechar sidebar em mobile após selecionar
            if (isMobile) {
              setSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Conteúdo principal */}
      <main 
        id="main-content" 
        className={`main-content ${sidebarOpen && !isMobile ? 'with-sidebar' : ''}`}
      >
        <ContentRenderer activeTool={activeTool} />
      </main>
    </div>
  );
}

export default App;