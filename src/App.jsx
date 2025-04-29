// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { FaBars, FaTimes, FaAccessibleIcon } from 'react-icons/fa';

// Componente de erro para evitar tela branca em caso de problemas
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error("Erro capturado pelo ErrorBoundary:", error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee', 
        color: '#c62828',
        border: '1px solid #ef5350',
        borderRadius: '4px',
        margin: '20px',
        fontFamily: 'sans-serif'
      }}>
        <h2>Algo deu errado</h2>
        <p>Ocorreu um erro na aplicação. Tente recarregar a página.</p>
        {error && (
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            {error.toString()}
          </pre>
        )}
      </div>
    );
  }

  return children;
}

// Criando o contexto de tema com valores padrão seguros
const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

// Componente Sidebar simplificado
function Sidebar({ activeTool, setActiveTool, darkMode, toggleTheme }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span role="img" aria-label="Acessibilidade">♿</span>
          <span>AssistAcess</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        <div 
          className={activeTool === 'chat' ? 'active' : ''}
          onClick={() => setActiveTool('chat')}
        >
          Chat
        </div>
        <div 
          className={activeTool === 'url' ? 'active' : ''}
          onClick={() => setActiveTool('url')}
        >
          Analisar URL
        </div>
        <div 
          className={activeTool === 'upload' ? 'active' : ''}
          onClick={() => setActiveTool('upload')}
        >
          Upload de HTML
        </div>
        <div 
          className={activeTool === 'guide' ? 'active' : ''}
          onClick={() => setActiveTool('guide')}
        >
          Guia WCAG
        </div>
      </div>
      
      <div className="sidebar-footer">
        <button onClick={toggleTheme}>
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
    </nav>
  );
}

// Componente de conteúdo simples
function Content({ activeTool }) {
  return (
    <div className="content">
      <h2>{getToolTitle(activeTool)}</h2>
      <p>Esta é uma versão simplificada para depuração.</p>
      <p>Ferramenta atual: {activeTool}</p>
    </div>
  );
}

// Função auxiliar para obter título da ferramenta
function getToolTitle(tool) {
  switch (tool) {
    case 'chat': return 'Chat AssistAcess';
    case 'url': return 'Analisar URL';
    case 'upload': return 'Upload de HTML';
    case 'guide': return 'Guia WCAG';
    default: return 'AssistAcess';
  }
}

// Hook personalizado para usar o contexto de tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error("useTheme deve ser usado dentro de um ThemeProvider");
    // Retornar valores padrão seguros em vez de quebrar
    return { darkMode: false, toggleTheme: () => {} };
  }
  return context;
};

// Componente principal App
function App() {
  // Estado para o modo escuro
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // Tenta ler do localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Fallback para preferência do sistema
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error("Erro ao ler a preferência de tema:", error);
      return false; // Valor padrão seguro
    }
  });

  // Estado para a ferramenta ativa
  const [activeTool, setActiveTool] = useState('chat');
  
  // Estado para controlar a visibilidade da sidebar em dispositivos móveis
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Função para alternar o tema
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Aplicar tema quando mudar
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      // Log para depuração
      console.log("Modo escuro atualizado:", darkMode);
    } catch (error) {
      console.error("Erro ao aplicar tema:", error);
    }
  }, [darkMode]);

  // Detectar dispositivos móveis e ajustar a sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Verificação inicial
    handleResize();

    // Adicionar listener
    window.addEventListener('resize', handleResize);
    
    // Limpar listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para alternar a sidebar em dispositivos móveis
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Valor do contexto de tema
  const themeContextValue = {
    darkMode,
    toggleTheme
  };

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={themeContextValue}>
        <div className={`app-container ${darkMode ? 'dark' : ''}`}>
          {/* Botão de menu para dispositivos móveis */}
          <button 
            className="mobile-menu-button"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          {/* Sidebar */}
          <div className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
            <Sidebar 
              activeTool={activeTool} 
              setActiveTool={setActiveTool}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
            />
          </div>
          
          {/* Conteúdo principal */}
          <main className="main-content">
            <header className="main-header">
              <h1>
                <FaAccessibleIcon /> Assistente de Acessibilidade
              </h1>
            </header>
            
            <div className="content-area">
              <Content activeTool={activeTool} />
            </div>
            
            <footer className="main-footer">
              <p>AssistAcess © 2025</p>
            </footer>
          </main>
        </div>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;