// App.jsx - Adicionando funcionalidades de dúvidas sobre WCAG

import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import PdfReport from './components/PdfReport';
import UrlInput from './components/UrlInput';
import FileUpload from './components/FileUpload';
import WcagGuideWidget from './components/WcagGuideWidget';

// Base de conhecimento WCAG simplificada
const wcagKnowledgeBase = {
  "perceivable": {
    "title": "Princípio 1: Perceptível",
    "description": "As informações e os componentes da interface do usuário devem ser apresentados aos usuários de maneira que eles possam perceber.",
    "guidelines": [
      {
        "id": "1.1",
        "name": "Alternativas em Texto",
        "description": "Forneça alternativas em texto para qualquer conteúdo não textual.",
        "examples": [
          "Imagens devem ter textos alternativos descritivos.",
          "Vídeos precisam ter legendas e audiodescrição."
        ]
      },
      {
        "id": "1.2",
        "name": "Mídia Baseada em Tempo",
        "description": "Forneça alternativas para mídia baseada em tempo.",
        "examples": [
          "Vídeos devem ter legendas sincronizadas.",
          "Áudios pré-gravados precisam ter transcrição."
        ]
      },
      {
        "id": "1.3",
        "name": "Adaptável",
        "description": "Crie conteúdo que possa ser apresentado de diferentes maneiras sem perder informações.",
        "examples": [
          "Use marcação semântica adequada (H1, H2, etc.).",
          "Não transmita informações apenas através de cor."
        ]
      },
      {
        "id": "1.4",
        "name": "Distinguível",
        "description": "Facilite a visualização e audição de conteúdos, separando o primeiro plano do plano de fundo.",
        "examples": [
          "Contraste mínimo de 4.5:1 para texto normal.",
          "Possibilidade de redimensionar texto até 200% sem perda de conteúdo."
        ]
      }
    ]
  },
  "operable": {
    "title": "Princípio 2: Operável",
    "description": "Os componentes da interface do usuário e a navegação devem ser operáveis.",
    "guidelines": [
      {
        "id": "2.1",
        "name": "Acessível por Teclado",
        "description": "Torne toda funcionalidade disponível a partir de um teclado.",
        "examples": [
          "Todos os controles devem ser acessíveis via teclado.",
          "Evite armadilhas de teclado."
        ]
      },
      {
        "id": "2.2",
        "name": "Tempo Suficiente",
        "description": "Forneça aos usuários tempo suficiente para ler e usar o conteúdo.",
        "examples": [
          "Permita desativar, ajustar ou estender limites de tempo.",
          "Evite conteúdo que pisca ou se move automaticamente."
        ]
      },
      {
        "id": "2.3",
        "name": "Convulsões e Reações Físicas",
        "description": "Não desenvolva conteúdo que possa causar convulsões ou reações físicas.",
        "examples": [
          "Evite conteúdo que pisque mais de 3 vezes por segundo.",
          "Não use animações com flashes intensos."
        ]
      },
      {
        "id": "2.4",
        "name": "Navegável",
        "description": "Forneça maneiras de ajudar os usuários a navegar, encontrar conteúdo e determinar onde estão.",
        "examples": [
          "Use títulos e rótulos descritivos.",
          "Destaque visualmente o foco do teclado."
        ]
      },
      {
        "id": "2.5",
        "name": "Modalidades de Entrada",
        "description": "Facilite a operação através de várias entradas além do teclado.",
        "examples": [
          "Suporte gestos simples em vez de complexos.",
          "Ofereça alternativas para ações dependentes de dispositivo."
        ]
      }
    ]
  },
  "understandable": {
    "title": "Princípio 3: Compreensível",
    "description": "A informação e a operação da interface do usuário devem ser compreensíveis.",
    "guidelines": [
      {
        "id": "3.1",
        "name": "Legível",
        "description": "Torne o conteúdo textual legível e compreensível.",
        "examples": [
          "Identifique o idioma principal da página.",
          "Defina abreviações e palavras incomuns."
        ]
      },
      {
        "id": "3.2",
        "name": "Previsível",
        "description": "Faça com que as páginas da Web apareçam e funcionem de maneira previsível.",
        "examples": [
          "Não inicie alterações automáticas ao receber foco.",
          "Mantenha navegação consistente entre páginas."
        ]
      },
      {
        "id": "3.3",
        "name": "Assistência de Entrada",
        "description": "Ajude os usuários a evitar e corrigir erros.",
        "examples": [
          "Identifique erros de forma clara e específica.",
          "Forneça rótulos e instruções para formulários."
        ]
      }
    ]
  },
  "robust": {
    "title": "Princípio 4: Robusto",
    "description": "O conteúdo deve ser robusto o suficiente para ser interpretado por diversos agentes de usuário, incluindo tecnologias assistivas.",
    "guidelines": [
      {
        "id": "4.1",
        "name": "Compatível",
        "description": "Maximize a compatibilidade com agentes de usuário atuais e futuros, incluindo tecnologias assistivas.",
        "examples": [
          "Use marcação válida (HTML bem formado).",
          "Forneça nome, função e valor para componentes personalizados."
        ]
      }
    ]
  },
  "general": {
    "title": "Informações Gerais sobre WCAG",
    "description": "O WCAG (Web Content Accessibility Guidelines) são diretrizes que tornam o conteúdo da web mais acessível para pessoas com deficiências.",
    "levels": [
      {
        "name": "Nível A",
        "description": "Nível mínimo de conformidade. Requisitos básicos que devem ser atendidos."
      },
      {
        "name": "Nível AA",
        "description": "Nível intermediário. Aborda as principais barreiras de acesso. Geralmente o nível adotado como padrão em legislações."
      },
      {
        "name": "Nível AAA",
        "description": "Nível mais alto. Implementa acessibilidade avançada, mas alguns critérios podem não ser aplicáveis a todos os tipos de conteúdo."
      }
    ],
    "versions": [
      {
        "name": "WCAG 2.0",
        "year": 2008,
        "description": "Versão que estabeleceu os quatro princípios fundamentais e níveis de conformidade."
      },
      {
        "name": "WCAG 2.1",
        "year": 2018,
        "description": "Ampliou o WCAG 2.0 com foco em dispositivos móveis, pessoas com baixa visão e deficiências cognitivas."
      },
      {
        "name": "WCAG 2.2",
        "year": 2023,
        "description": "Adicionou critérios para melhorar a acessibilidade para pessoas com deficiências cognitivas e dispositivos móveis."
      }
    ]
  }
};

// Função para processar perguntas sobre WCAG
const processWcagQuestion = (question) => {
  question = question.toLowerCase();
  
  // Verifica se a pergunta contém palavras-chave relacionadas a WCAG
  if (question.includes('wcag') || 
      question.includes('acessibilidade') || 
      question.includes('accessibility') ||
      question.includes('perceptível') || 
      question.includes('perceivable') ||
      question.includes('operável') || 
      question.includes('operable') ||
      question.includes('compreensível') || 
      question.includes('understandable') ||
      question.includes('robusto') || 
      question.includes('robust')) {
    
    // Identifica o princípio mais relevante
    let relevantSection = 'general';
    let score = 0;
    
    for (const section in wcagKnowledgeBase) {
      let currentScore = 0;
      
      // Verificar o título e descrição do princípio
      if (question.includes(section)) {
        currentScore += 5;
      }
      
      if (question.includes(wcagKnowledgeBase[section].title.toLowerCase())) {
        currentScore += 5;
      }
      
      // Verificar cada diretriz dentro do princípio
      if (wcagKnowledgeBase[section].guidelines) {
        for (const guideline of wcagKnowledgeBase[section].guidelines) {
          if (question.includes(guideline.id.toLowerCase()) || 
              question.includes(guideline.name.toLowerCase())) {
            currentScore += 10;
          }
        }
      }
      
      if (currentScore > score) {
        score = currentScore;
        relevantSection = section;
      }
    }
    
    // Formata a resposta baseada na seção mais relevante
    const section = wcagKnowledgeBase[relevantSection];
    let response = `${section.title}: ${section.description}\n\n`;
    
    if (section.guidelines) {
      response += "Principais diretrizes:\n";
      for (const guideline of section.guidelines) {
        response += `• ${guideline.id} ${guideline.name}: ${guideline.description}\n`;
      }
    }
    
    if (section.levels) {
      response += "\nNíveis de conformidade WCAG:\n";
      for (const level of section.levels) {
        response += `• ${level.name}: ${level.description}\n`;
      }
    }
    
    if (section.versions) {
      response += "\nVersões do WCAG:\n";
      for (const version of section.versions) {
        response += `• ${version.name} (${version.year}): ${version.description}\n`;
      }
    }
    
    return response;
  }
  
  return null; // Não é uma pergunta sobre WCAG
};

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Sou o AssistAcess, seu assistente de acessibilidade. Posso analisar sites ou arquivos HTML, gerar relatórios de acessibilidade e responder dúvidas sobre WCAG. Como posso ajudar você hoje?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPdfReport, setShowPdfReport] = useState(false);
  const [accessibilityReport, setAccessibilityReport] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [url, setUrl] = useState('');
  const [showWcagGuide, setShowWcagGuide] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Adiciona mensagem do usuário
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Adiciona mensagem de "digitando" temporária
    const typingMessage = {
      id: messages.length + 2,
      text: '...',
      sender: 'bot',
      isTyping: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Processa a mensagem do usuário
    setTimeout(() => {
      // Remove a mensagem de digitando
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      // Verifica se é uma pergunta sobre WCAG
      const wcagResponse = processWcagQuestion(input);
      
      if (wcagResponse) {
        // É uma pergunta sobre WCAG
        const botResponse = {
          id: messages.length + 2,
          text: wcagResponse,
          sender: 'bot',
          timestamp: new Date(),
          showWcagGuideButton: true,
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Não é uma pergunta específica sobre WCAG
        const botResponse = {
          id: messages.length + 2,
          text: "Para analisar a acessibilidade de um site, você pode inserir uma URL ou fazer upload de um arquivo HTML. Se tiver dúvidas sobre WCAG, pode me perguntar sobre qualquer princípio ou diretriz específica.",
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    }, 1500);
  };

  const handleUrlSubmit = async (submittedUrl) => {
    setUrl(submittedUrl);
    setIsAnalyzing(true);
    
    // Adiciona mensagem do bot sobre início da análise
    const analysisMessage = {
      id: messages.length + 1,
      text: `Analisando a URL: ${submittedUrl}. Isso pode levar alguns instantes...`,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    
    try {
      // Simulando uma análise (aqui seria a integração com seu backend)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulação de resultado
      const mockReport = {
        url: submittedUrl,
        score: 78,
        issues: [
          { severity: 'high', description: 'Falta de texto alternativo em imagens', wcagRef: '1.1.1' },
          { severity: 'medium', description: 'Contraste de cores insuficiente', wcagRef: '1.4.3' },
          { severity: 'high', description: 'Elementos de formulário sem labels', wcagRef: '3.3.2' },
          { severity: 'low', description: 'Estrutura de cabeçalhos inconsistente', wcagRef: '2.4.6' },
        ],
        improvements: [
          'Adicionar texto alternativo a todas as imagens (WCAG 1.1.1)',
          'Aumentar o contraste entre texto e fundo para pelo menos 4.5:1 (WCAG 1.4.3)',
          'Associar labels a todos os campos de formulário (WCAG 3.3.2)',
          'Estruturar cabeçalhos em ordem lógica (h1, h2, h3) (WCAG 2.4.6)',
        ]
      };
      
      setAccessibilityReport(mockReport);
      
      // Adiciona mensagem do bot com o resultado
      const resultMessage = {
        id: messages.length + 2,
        text: `Análise concluída! O site recebeu uma pontuação de acessibilidade de ${mockReport.score}/100. Encontrei alguns problemas que podem ser corrigidos. Você pode visualizar o relatório detalhado e baixar o PDF com as melhorias sugeridas.`,
        sender: 'bot',
        timestamp: new Date(),
        showReportButton: true,
      };
      
      setMessages(prev => [...prev, resultMessage]);
      
    } catch (error) {
      // Adiciona mensagem de erro
      const errorMessage = {
        id: messages.length + 2,
        text: `Ocorreu um erro ao analisar a URL: ${error.message}. Por favor, tente novamente ou use um arquivo HTML.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    // Adiciona mensagem do bot sobre início da análise
    const analysisMessage = {
      id: messages.length + 1,
      text: `Analisando o arquivo: ${file.name}. Isso pode levar alguns instantes...`,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    
    try {
      // Simulando uma análise (aqui seria a integração com seu backend)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulação de resultado
      const mockReport = {
        fileName: file.name,
        score: 65,
        issues: [
          { severity: 'high', description: 'Falta de labels em formulários', wcagRef: '3.3.2' },
          { severity: 'high', description: 'Falta de atributos ARIA', wcagRef: '4.1.2' },
          { severity: 'medium', description: 'Links sem descrição adequada', wcagRef: '2.4.4' },
          { severity: 'low', description: 'Falta de landmarks', wcagRef: '1.3.1' },
        ],
        improvements: [
          'Adicionar labels descritivos a todos os campos de formulário (WCAG 3.3.2)',
          'Implementar atributos ARIA para elementos interativos (WCAG 4.1.2)',
          'Tornar links descritivos e únicos (WCAG 2.4.4)',
          'Usar landmarks HTML5 para estruturar o conteúdo (WCAG 1.3.1)',
        ]
      };
      
      setAccessibilityReport(mockReport);
      
      // Adiciona mensagem do bot com o resultado
      const resultMessage = {
        id: messages.length + 2,
        text: `Análise concluída! O arquivo recebeu uma pontuação de acessibilidade de ${mockReport.score}/100. Encontrei diversos problemas que precisam ser corrigidos. Você pode visualizar o relatório detalhado e baixar o PDF com as melhorias sugeridas.`,
        sender: 'bot',
        timestamp: new Date(),
        showReportButton: true,
      };
      
      setMessages(prev => [...prev, resultMessage]);
      
    } catch (error) {
      // Adiciona mensagem de erro
      const errorMessage = {
        id: messages.length + 2,
        text: `Ocorreu um erro ao analisar o arquivo: ${error.message}. Por favor, tente novamente ou use uma URL.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleViewReport = () => {
    setShowPdfReport(true);
  };

  const handleClosePdfReport = () => {
    setShowPdfReport(false);
  };
  
  const handleViewWcagGuide = () => {
    setShowWcagGuide(true);
  };
  
  const handleCloseWcagGuide = () => {
    setShowWcagGuide(false);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">
          <img src="/accessibility-logo.svg" alt="AssistAcess Logo" />
          <h1>AssistAcess</h1>
        </div>
        <div className="sidebar-options">
          <h3>Análise de Acessibilidade</h3>
          <UrlInput onSubmit={handleUrlSubmit} disabled={isAnalyzing} />
          <FileUpload onUpload={handleFileUpload} disabled={isAnalyzing} />
          
          <div className="sidebar-section">
            <h4>Guia WCAG</h4>
            <button className="wcag-guide-button" onClick={handleViewWcagGuide}>
              Abrir Guia WCAG
            </button>
          </div>
          
          <div className="sidebar-section">
            <h4>Sugestões de Perguntas</h4>
            <div className="question-suggestions">
              <button className="suggestion-button" onClick={() => setInput("O que é WCAG?")}>
                O que é WCAG?
              </button>
              <button className="suggestion-button" onClick={() => setInput("Quais são os princípios do WCAG?")}>
                Quais são os princípios do WCAG?
              </button>
              <button className="suggestion-button" onClick={() => setInput("Como melhorar a acessibilidade do meu site?")}>
                Como melhorar a acessibilidade?
              </button>
            </div>
          </div>
        </div>
        <div className="sidebar-footer">
          <p>Desenvolvido com 💚</p>
          <p>© 2025 AssistAcess</p>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="chat-header">
          <h2>Assistente de Acessibilidade</h2>
        </div>
        
        <div className="chat-messages">
          {messages.map(message => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onViewReport={handleViewReport}
              onViewWcagGuide={handleViewWcagGuide}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isAnalyzing}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={input.trim() === '' || isAnalyzing}
            className="send-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      {showPdfReport && accessibilityReport && (
        <PdfReport 
          report={accessibilityReport} 
          onClose={handleClosePdfReport} 
        />
      )}
      
      {showWcagGuide && (
        <WcagGuideWidget 
          wcagData={wcagKnowledgeBase} 
          onClose={handleCloseWcagGuide} 
        />
      )}
    </div>
  );
}

export default App;