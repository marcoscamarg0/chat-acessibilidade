// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { FaBars, FaTimes, FaAccessibleIcon } from 'react-icons/fa';
import Chat from './components/ChatInterface';
import UrlAnalyzer from './components/UrlAnalyzer';
import FileUploader from './components/FileUploader';
import WcagGuide from './components/WcagGuide';

// Componente de erro para evitar tela branca em caso de problemas
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo deu errado</h2>
          <p>Ocorreu um erro na aplicação. Tente recarregar a página.</p>
          {this.state.error && (
            <pre className="error-details">
              {this.state.error.toString()}
            </pre>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="reload-button"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Criando o contexto de tema com valores padrão seguros
const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

// Componente Sidebar com suporte para navegação com Tab
function Sidebar({ activeTool, setActiveTool, darkMode, toggleTheme }) {
  const menuItems = [
    { id: 'chat', label: 'Chat', icon: '💬', ariaLabel: 'Chat com assistente' },
    { id: 'url', label: 'Analisar URL', icon: '🔗', ariaLabel: 'Analisar acessibilidade de URL' },
    { id: 'upload', label: 'Upload de HTML', icon: '📄', ariaLabel: 'Analisar arquivo HTML' },
    { id: 'guide', label: 'Guia WCAG', icon: '📚', ariaLabel: 'Consultar guia WCAG' },
  ];

  return (
    <nav className="sidebar" aria-label="Menu principal">
      <div className="sidebar-header">
        <div className="logo">
          <span role="img" aria-label="Ícone de acessibilidade">♿</span>
          <span>AssistAcess</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div 
            key={item.id}
            role="button"
            tabIndex={0}
            className={activeTool === item.id ? 'active' : ''}
            onClick={() => setActiveTool(item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTool(item.id);
              }
            }}
            aria-label={item.ariaLabel}
            aria-selected={activeTool === item.id}
          >
            <span className="menu-icon" aria-hidden="true">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <button 
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
      </div>
    </nav>
  );
}

// Componente de conteúdo simples
function Content({ activeTool }) {
  const tools = {
    chat: {
      title: 'Chat AssistAcess',
      component: Chat
    },
    url: {
      title: 'Analisar URL',
      component: UrlAnalyzer
    },
    upload: {
      title: 'Upload de HTML',
      component: FileUploader
    },
    guide: {
      title: 'Guia WCAG',
      component: WcagGuide
    }
  };

  const tool = tools[activeTool] || tools.chat;
  const ToolComponent = tool.component;

  return (
    <div className="content">
      <h2>{tool.title}</h2>
      <ToolComponent />
    </div>
  );
}

// Hook personalizado para usar o contexto de tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error("useTheme deve ser usado dentro de um ThemeProvider");
    return { darkMode: false, toggleTheme: () => {} };
  }
  return context;
};

// Componente principal App
function App() {
  // Estado para o modo escuro
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error("Erro ao ler a preferência de tema:", error);
      return false;
    }
  });

  // Estado para a ferramenta ativa
  const [activeTool, setActiveTool] = useState('chat');
  
  // Estado para controlar a visibilidade da sidebar em dispositivos móveis
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

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
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
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

    window.addEventListener('resize', handleResize);
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
          {/* Link para pular para o conteúdo - acessibilidade */}
          <a href="#main-content" className="skip-link">
            Pular para o conteúdo
          </a>
          
          {/* Botão de menu para dispositivos móveis */}
          <button 
            className="mobile-menu-button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
          >
            {sidebarOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
          
          {/* Sidebar */}
          <div 
            id="sidebar"
            className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}
            aria-hidden={!sidebarOpen && window.innerWidth < 768}
          >
            <Sidebar 
              activeTool={activeTool} 
              setActiveTool={(tool) => {
                setActiveTool(tool);
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
            />
          </div>
          
          {/* Conteúdo principal */}
          <main id="main-content" className="main-content" tabIndex={-1}>
            <header className="main-header">
              <h1>
                <FaAccessibleIcon aria-hidden="true" /> 
                Assistente de Acessibilidade
              </h1>
            </header>
            
            <div className="content-area">
              <Content activeTool={activeTool} />
            </div>
            
            <footer className="main-footer">
              <p>AssistAcess © 2025 · Desenvolvido para melhorar a acessibilidade web</p>
            </footer>
          </main>
        </div>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;