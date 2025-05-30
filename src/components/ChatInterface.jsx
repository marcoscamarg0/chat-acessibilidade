// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import TextToSpeech from './TextToSpeech';
import VoiceControl from './VoiceControl';
import ThemeToggle from './ThemeToggle';
import { getBotResponse } from '../services/chatbotService';
import { downloadChatPDF } from '../services/pdfGenerator';
import { speechService } from '../services/speechService';
import { 
  FaRobot, 
  FaUser, 
  FaPaperPlane, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaMicrophone,
  FaDownload,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaGlobe,
  FaChartLine,
  FaLightbulb,
  FaCog,
  FaPlay,
  FaPause,
  FaStop
} from 'react-icons/fa';
import './styles/ChatInterface.css';

function ChatInterface() {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Olá! Sou o AssistAcess, seu assistente de acessibilidade. Posso analisar sites (usando PageSpeed Insights), responder dúvidas sobre WCAG com a ajuda da IA Gemini e mais. Como posso ajudar você hoje?',
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Estados para controle de voz
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.1);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechService.getAvailableVoices();
      setAvailableVoices(voices);
      
      if (voices.length > 0 && !selectedVoice) {
        const bestVoice = speechService.getBestVoice();
        setSelectedVoice(bestVoice);
        speechService.setVoice(bestVoice);
      }
    };

    loadVoices();
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função para falar texto com configurações personalizadas
  const speakText = (text) => {
    speechService.speak(text, {
      rate: speechRate,
      pitch: speechPitch,
      volume: 0.8,
      language: 'pt-BR',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Função para parar a fala
  const stopSpeaking = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  // Função para alterar voz selecionada
  const handleVoiceChange = (event) => {
    const voiceName = event.target.value;
    const voice = availableVoices.find(v => v.name === voiceName);
    setSelectedVoice(voice);
    speechService.setVoice(voice);
  };

  // Função melhorada para detectar URLs
  const isValidURL = (string) => {
    const trimmed = string.trim();
    
    const urlPatterns = [
      /^https?:\/\/.+\..+/i,
      /^www\..+\..+/i,
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i,
    ];
    
    const matchesPattern = urlPatterns.some(pattern => pattern.test(trimmed));
    
    if (!matchesPattern) return false;
    
    try {
      new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Função para normalizar URL
  const normalizeURL = (string) => {
    const trimmed = string.trim();
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return new URL(trimmed).href;
      } else {
        return new URL(`https://${trimmed}`).href;
      }
    } catch (_) {
      return trimmed;
    }
  };

  // Função para obter cor baseada na pontuação
  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Função para obter emoji baseado na pontuação
  const getScoreEmoji = (score) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  };

  // Componente para renderizar análise formatada
  const AnalysisResult = ({ result, url }) => {
    const scoreColor = getScoreColor(result.score);
    const scoreEmoji = getScoreEmoji(result.score);
    
    return (
      <div className="analysis-result">
        <div className="analysis-header">
          <div className="analysis-title">
            <FaChartLine style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
            <strong>Análise de Acessibilidade Concluída</strong>
          </div>
          
          <div className="analysis-url">
            <FaGlobe style={{ marginRight: '0.5rem', color: '#6b7280' }} />
            <span className="url-text">{url}</span>
          </div>
        </div>

        <div className="analysis-score">
          <div className="score-circle" style={{ borderColor: scoreColor }}>
            <span className="score-number" style={{ color: scoreColor }}>
              {result.score}
            </span>
            <span className="score-label">/ 100</span>
          </div>
          <div className="score-description">
            <span className="score-emoji">{scoreEmoji}</span>
            <span className="score-text">
              {result.score >= 90 ? 'Excelente acessibilidade!' : 
               result.score >= 70 ? 'Boa acessibilidade' : 
               'Precisa melhorar'}
            </span>
          </div>
        </div>

        {result.violations && result.violations.length > 0 && (
          <div className="analysis-section violations">
            <div className="section-header">
              <FaTimesCircle style={{ color: '#ef4444', marginRight: '0.5rem' }} />
              <strong>Problemas Encontrados ({result.violations.length})</strong>
            </div>
            <div className="violations-list">
              {result.violations.slice(0, 5).map((violation, index) => (
                <div key={index} className="violation-item">
                  <div className="violation-title">
                    <span className="violation-number">{index + 1}</span>
                    <strong>{violation.id}</strong>
                  </div>
                  <div className="violation-description">
                    {violation.description}
                  </div>
                  {violation.help && (
                    <div className="violation-help">
                      <FaLightbulb style={{ marginRight: '0.25rem', color: '#f59e0b' }} />
                      {violation.help}
                    </div>
                  )}
                </div>
              ))}
              {result.violations.length > 5 && (
                <div className="more-violations">
                  ... e mais {result.violations.length - 5} problemas
                </div>
              )}
            </div>
          </div>
        )}

        {result.passes && result.passes.length > 0 && (
          <div className="analysis-section passes">
            <div className="section-header">
              <FaCheckCircle style={{ color: '#10b981', marginRight: '0.5rem' }} />
              <strong>Testes Aprovados ({result.passes.length})</strong>
            </div>
          </div>
        )}

        <div className="analysis-section recommendations">
          <div className="section-header">
            <FaLightbulb style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
            <strong>Recomendações</strong>
          </div>
          <div className="recommendations-list">
            <div className="recommendation-item">• Revise os problemas identificados acima</div>
            <div className="recommendation-item">• Teste com leitores de tela</div>
            <div className="recommendation-item">• Verifique a navegação por teclado</div>
            <div className="recommendation-item">• Valide o contraste de cores</div>
          </div>
        </div>

        <div className="analysis-footer">
          💬 <strong>Precisa de ajuda?</strong> Pergunte sobre qualquer aspecto específico de acessibilidade!
        </div>
      </div>
    );
  };

  // Função para analisar acessibilidade de um site
  const analyzeWebsiteAccessibility = async (url) => {
    setIsAnalyzing(true);
    
    try {
      const normalizedUrl = normalizeURL(url);
      
      const analysisMessage = {
        sender: 'bot',
        content: `Analisando a acessibilidade do site: ${normalizedUrl}`,
        timestamp: new Date(),
        isAnalyzing: true,
        type: 'analyzing'
      };
      setMessages(prev => [...prev, analysisMessage]);

      // Importar e usar o serviço de acessibilidade
      const accessibilityService = await import('../services/accessibilityChecker');
      
      let result;
      if (accessibilityService.checkAccessibility) {
        result = await accessibilityService.checkAccessibility(normalizedUrl);
      } else if (accessibilityService.default && accessibilityService.default.checkAccessibility) {
        result = await accessibilityService.default.checkAccessibility(normalizedUrl);
      } else {
        throw new Error('Função checkAccessibility não encontrada no serviço');
      }
      
      // Remover mensagem de análise em andamento
      setMessages(prev => prev.filter(msg => !msg.isAnalyzing));
      
      return {
        type: 'analysis',
        result,
        url: normalizedUrl
      };
      
    } catch (error) {
      console.error('Erro ao analisar acessibilidade:', error);
      
      // Remover mensagem de análise em andamento em caso de erro
      setMessages(prev => prev.filter(msg => !msg.isAnalyzing));
      
      return {
        type: 'error',
        error: error.message,
        url
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceInput = (transcript) => {
    setInputMessage(transcript);
  };

  const handleSendMessage = async (messageToSend = inputMessage) => {
    const trimmedMessage = messageToSend.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      sender: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (messageToSend === inputMessage) {
      setInputMessage('');
    }
    setIsTyping(true);

    try {
      let botResponse;
      
      // Verificar se a mensagem é uma URL válida
      if (isValidURL(trimmedMessage)) {
        console.log('URL detectada:', trimmedMessage);
        botResponse = await analyzeWebsiteAccessibility(trimmedMessage);
      } else {
        console.log('Pergunta normal detectada:', trimmedMessage);
        // Usar o serviço de chatbot normal para perguntas
        const botResponseText = await getBotResponse(trimmedMessage, 'chat');
        botResponse = {
          type: 'text',
          content: botResponseText
        };
      }

      const newBotMessage = {
        sender: 'bot',
        ...botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMessage]);

      // Leitura automática com voz personalizada
      if (autoRead && botResponse.type === 'text') {
        speakText(botResponse.content);
      }

    } catch (error) {
      console.error("Erro ao obter resposta do bot:", error);
      const errorBotMessage = {
        sender: 'bot',
        type: 'text',
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Verifique o console para detalhes.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownloadPDF = () => {
    try {
      downloadChatPDF(messages, `chat-assistaccess-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Função para renderizar conteúdo da mensagem
  const renderMessageContent = (message) => {
    if (message.type === 'analysis') {
      return <AnalysisResult result={message.result} url={message.url} />;
    }
    
    if (message.type === 'error') {
      return (
        <div className="error-message">
          <div className="error-header">
            <FaExclamationTriangle style={{ color: '#ef4444', marginRight: '0.5rem' }} />
            <strong>Erro na Análise de Acessibilidade</strong>
          </div>
          <div className="error-content">
            <p>Não foi possível analisar o site: <strong>{message.url}</strong></p>
            <div className="error-details">
              <strong>Erro:</strong> {message.error}
            </div>
            <div className="error-suggestions">
              <strong>Possíveis causas:</strong>
              <ul>
                <li>Site não está acessível</li>
                <li>URL inválida</li>
                <li>Problemas de conectividade</li>
                <li>Site bloqueia análises automatizadas</li>
                <li>Serviço de análise indisponível</li>
              </ul>
            </div>
            <div className="error-tip">
              💡 <strong>Dica:</strong> Verifique se a URL está correta e tente novamente.
            </div>
          </div>
        </div>
      );
    }
    
    if (message.type === 'analyzing') {
      return (
        <div className="analyzing-message">
          <div className="analyzing-header">
            <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem', color: '#3b82f6' }} />
            <strong>Analisando acessibilidade...</strong>
          </div>
          <div className="analyzing-content">
            <p>Site: <strong>{message.content.split(': ')[1]}</strong></p>
            <p>Por favor, aguarde... Isso pode levar alguns segundos.</p>
          </div>
        </div>
      );
    }
    
    if (message.type === 'welcome') {
      return (
        <div className="welcome-message">
          <div className="welcome-content">
            {message.content}
          </div>
          <div className="welcome-tip">
            💡 <strong>Dica:</strong> Cole uma URL para analisar a acessibilidade do site automaticamente!
          </div>
        </div>
      );
    }
    
    // Mensagem de texto normal
    return (
      <div className="text-message">
        {message.content.split('\n').map((line, lineIndex) => (
          <div key={lineIndex}>
            {line}
            {lineIndex < message.content.split('\n').length - 1 && <br />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`chat-container ${isFullscreen ? 'fullscreen' : ''} ${darkMode ? 'dark' : ''}`}>
      {/* Header com controles */}
      <div className="chat-header">
        <h2 className="chat-title">
          <FaRobot style={{ marginRight: '0.5rem' }} size={isMobile ? 18 : 20} /> 
          <span>AssistAcess Chat</span>
          {isAnalyzing && (
            <FaSpinner 
              style={{ marginLeft: '0.5rem', animation: 'spin 1s linear infinite' }} 
              size={16} 
              title="Analisando site..."
            />
          )}
        </h2>
        
        {/* Controles */}
        <div className="chat-controls">
          {/* Botão de configurações de voz */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`chat-button ${showVoiceSettings ? 'primary' : 'secondary'}`}
            style={{ borderRadius: '1rem', padding: '0.5rem 0.75rem' }}
            aria-pressed={showVoiceSettings}
            aria-label="Configurações de voz"
            title="Configurações de voz"
          >
            <FaCog style={{ marginRight: isMobile ? '0' : '0.5rem' }} size={14} />
            {!isMobile && <span>Voz</span>}
          </button>

          {/* Botão de leitura automática */}
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`chat-button ${autoRead ? 'primary' : 'secondary'}`}
            style={{ borderRadius: '1rem', padding: '0.5rem 0.75rem' }}
            aria-pressed={autoRead}
            aria-label={autoRead ? "Desativar leitura automática" : "Ativar leitura automática"}
          >
            {autoRead ? <FaVolumeUp style={{ marginRight: '0.5rem' }} size={14} /> : <FaVolumeMute style={{ marginRight: '0.5rem' }} size={14} />}
            <span>{autoRead ? (isMobile ? "Ativa" : "Leitura Ativa") : (isMobile ? "Inativa" : "Leitura Inativa")}</span>
          </button>

          {/* Controle de fala ativa */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="chat-button primary"
              style={{ borderRadius: '1rem', padding: '0.5rem 0.75rem' }}
              aria-label="Parar leitura"
              title="Parar leitura"
            >
              <FaStop style={{ marginRight: isMobile ? '0' : '0.5rem' }} size={14} />
              {!isMobile && <span>Parar</span>}
            </button>
          )}

          {/* Botão de download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={messages.length <= 1}
            className={`chat-button ${messages.length > 1 ? 'primary' : 'secondary'}`}
            style={{ borderRadius: '1rem', padding: '0.5rem 0.75rem' }}
            aria-label="Baixar conversa em PDF"
            title="Baixar conversa em PDF"
          >
            <FaDownload style={{ marginRight: isMobile ? '0' : '0.5rem' }} size={14} />
            {!isMobile && <span>PDF</span>}
          </button>

          {/* Botão fullscreen (apenas desktop) */}
          {!isMobile && (
            <button
              onClick={toggleFullscreen}
              className="chat-button secondary"
              style={{ borderRadius: '1rem', padding: '0.5rem 0.75rem' }}
              aria-label={isFullscreen ? "Sair do modo tela cheia" : "Entrar em tela cheia"}
              title={isFullscreen ? "Sair do modo tela cheia" : "Entrar em tela cheia"}
            >
              {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Painel de configurações de voz */}
      {showVoiceSettings && (
        <div className="voice-settings-panel" style={{
          padding: '1rem',
          backgroundColor: darkMode ? '#374151' : '#f9fafb',
          borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem',
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <div style={{ flex: 1 }}>
            <label 
              htmlFor="voice-select" 
              style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: darkMode ? '#e5e7eb' : '#374151'
              }}
            >
              Escolher Voz:
            </label>
            <select
              id="voice-select"
              value={selectedVoice?.name || ''}
              onChange={handleVoiceChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                color: darkMode ? '#e5e7eb' : '#374151',
                fontSize: '0.875rem'
              }}
              aria-label="Selecionar voz para síntese"
            >
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label 
              htmlFor="speech-rate" 
              style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: darkMode ? '#e5e7eb' : '#374151'
              }}
            >
              Velocidade: {speechRate.toFixed(1)}x
            </label>
            <input
              id="speech-rate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Ajustar velocidade da fala"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label 
              htmlFor="speech-pitch" 
              style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: darkMode ? '#e5e7eb' : '#374151'
              }}
            >
              Tom: {speechPitch.toFixed(1)}
            </label>
            <input
              id="speech-pitch"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Ajustar tom da fala"
            />
          </div>

          {selectedVoice && (
            <div>
              <button
                onClick={() => speakText('Esta é uma demonstração da voz selecionada com as configurações atuais.')}
                disabled={isSpeaking}
                className="chat-button primary"
                style={{ borderRadius: '0.5rem', padding: '0.5rem 1rem' }}
                aria-label="Testar voz selecionada"
              >
                {isSpeaking ? (
                  <>
                    <FaSpinner style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} size={14} />
                    Falando...
                  </>
                ) : (
                  <>
                    <FaPlay style={{ marginRight: '0.5rem' }} size={14} />
                    Testar
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Área de mensagens */}
      <div 
        ref={chatContainerRef}
        className="chat-messages-area"
        aria-live="polite" 
        aria-atomic="false"
        aria-relevant="additions text"
        id="chat-history"
        role="log"
        aria-label="Histórico de mensagens do chat"
        style={{ 
          maxHeight: isMobile ? 'calc(100vh - 200px)' : isFullscreen ? 'calc(100vh - 180px)' : '60vh',
          minHeight: isMobile ? '300px' : '400px'
        }}
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message-container ${message.sender} ${message.isAnalyzing ? 'analyzing' : ''} ${message.type || ''}`}
            role="article"
            aria-labelledby={`message-sender-${index}`}
            aria-describedby={`message-content-${index} message-timestamp-${index}`}
          >
            <div className="message-content">
              {message.sender === 'bot' && (
                <div className="message-avatar bot" aria-hidden="true">
                  {message.isAnalyzing ? (
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={isMobile ? 12 : 16} />
                  ) : (
                    <FaRobot size={isMobile ? 12 : 16} />
                  )}
                </div>
              )}
              
              <div className={`message-bubble ${message.sender} ${message.type || ''}`}>
                {message.sender === 'bot' && (
                  <span id={`message-sender-${index}`} className="sr-only">Assistente diz:</span>
                )}
                {message.sender === 'user' && (
                  <span id={`message-sender-${index}`} className="sr-only">Você diz:</span>
                )}
                
                <div id={`message-content-${index}`} className="message-text">
                  {renderMessageContent(message)}
                </div>
                
                <div id={`message-timestamp-${index}`} className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                
                {/* Controles de TTS para mensagens do bot */}
                {message.sender === 'bot' && !message.isAnalyzing && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    right: '-8px',
                    display: 'flex',
                    gap: '0.25rem'
                  }}> 
                    {/* Botão de reproduzir/parar */}
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else {
                          const textToSpeak = message.type === 'text' ? message.content : 
                                            message.type === 'welcome' ? message.content :
                                            'Análise de acessibilidade concluída. Verifique os resultados na tela.';
                          speakText(textToSpeak);
                        }
                      }}
                      className="chat-button secondary"
                      style={{ 
                        padding: '0.375rem', 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                        borderRadius: '50%',
                        minWidth: '32px',
                        height: '32px'
                      }}
                      aria-label={isSpeaking ? "Parar leitura" : "Ler mensagem"}
                      title={isSpeaking ? "Parar leitura" : "Ler mensagem"}
                    >
                      {isSpeaking ? (
                        <FaStop size={12} />
                      ) : (
                        <FaVolumeUp size={12} />
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              {message.sender === 'user' && (
                <div className="message-avatar user" aria-hidden="true">
                  <FaUser size={isMobile ? 12 : 16} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Indicador de digitação */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="message-avatar bot" aria-hidden="true">
              <FaRobot size={isMobile ? 12 : 16} />
            </div>
            <div className="typing-bubble">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <div className="sr-only" aria-live="assertive">AssistAcess está digitando...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Área de input */}
      <div className="chat-input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            rows="1"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              e.target.style.height = 'auto';
              const newHeight = Math.min(e.target.scrollHeight, isMobile ? 80 : 120);
              e.target.style.height = `${newHeight}px`;
            }}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre WCAG ou cole uma URL para analisar..."
            className="chat-textarea"
            aria-label="Caixa de entrada de mensagem ou URL"
            disabled={isAnalyzing}
            style={{ 
              scrollbarWidth: 'thin',
              minHeight: isMobile ? '36px' : '40px',
              maxHeight: isMobile ? '80px' : '120px'
            }}
          />
          
          {/* Controles de voz e envio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <VoiceControl
              onTranscriptChange={handleVoiceInput}
              buttonPosition="inline"
              language="pt-BR"
              darkMode={darkMode}
              className="chat-button secondary"
              disabled={isAnalyzing}
            />
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping || isAnalyzing}
              className={`chat-button ${(inputMessage.trim() && !isTyping && !isAnalyzing) ? 'primary' : 'secondary'}`}
              aria-label="Enviar mensagem"
              title="Enviar mensagem"
            >
              {isAnalyzing ? (
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={isMobile ? 14 : 16} />
              ) : (
                <FaPaperPlane size={isMobile ? 14 : 16} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Instruções de uso */}
      <div style={{ 
        fontSize: '0.75rem', 
        color: darkMode ? '#9ca3af' : '#6b7280', 
        marginTop: '0.5rem', 
        textAlign: 'center', 
        padding: '0 0.5rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: isMobile ? '0.25rem' : '1rem' 
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Pressione <kbd style={{ 
              padding: '0.125rem 0.375rem', 
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, 
              borderRadius: '0.25rem', 
              backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
              fontSize: '0.75rem' 
            }}>Enter</kbd> para enviar
          </span>
          {!isMobile && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <kbd style={{ 
                  padding: '0.125rem 0.375rem', 
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, 
                  borderRadius: '0.25rem', 
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                  fontSize: '0.75rem' 
                }}>Shift</kbd> + 
                <kbd style={{ 
                  padding: '0.125rem 0.375rem', 
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, 
                  borderRadius: '0.25rem', 
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                  fontSize: '0.75rem' 
                }}>Enter</kbd> para nova linha
              </span>
              <span style={{ color: darkMode ? '#60a5fa' : '#3b82f6' }}>
                🌐 URLs são analisadas automaticamente
              </span>
              <span style={{ color: darkMode ? '#10b981' : '#059669' }}>
                🎤 Voz humanizada disponível
              </span>
            </>
          )}
        </div>
        {isMobile && (
          <div style={{ marginTop: '0.25rem' }}>
            <div style={{ color: darkMode ? '#60a5fa' : '#3b82f6' }}>
              🌐 URLs são analisadas automaticamente
            </div>
            <div style={{ color: darkMode ? '#10b981' : '#059669' }}>
              🎤 Voz humanizada disponível
            </div>
          </div>
        )}
      </div>

      {/* Overlay para fechar fullscreen no mobile */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 60,
            padding: '0.5rem',
            backgroundColor: 'rgba(31, 41, 55, 0.75)',
            color: 'white',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          aria-label="Fechar tela cheia"
        >
          <FaCompress size={16} />
        </button>
      )}
    </div>
  );
}

export default ChatInterface;