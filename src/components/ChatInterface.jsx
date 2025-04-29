// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../App'; // Atualizar a importação
import TextToSpeech from './TextToSpeech';
import VoiceControl from './VoiceControl';
import { FaRobot, FaUser, FaMicrophone, FaPaperPlane, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

function ChatInterface() {
  const { darkMode } = useTheme(); // Usar o hook do App.jsx
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Olá! Sou o AssistAcess, seu assistente de acessibilidade. Posso analisar sites ou arquivos HTML, gerar relatórios de acessibilidade e responder dúvidas sobre WCAG. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice input
  const handleVoiceInput = (transcript) => {
    setInputMessage(transcript);
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      // Simulated response for demonstration
      let botResponse = "Estou processando sua solicitação...";
      
      if (inputMessage.toLowerCase().includes('wcag')) {
        botResponse = "WCAG (Web Content Accessibility Guidelines) são diretrizes que tornam o conteúdo da web mais acessível. A versão atual é WCAG 2.1 com níveis A, AA e AAA de conformidade.";
      } else if (inputMessage.toLowerCase().includes('acessibilidade')) {
        botResponse = "A acessibilidade web permite que pessoas com deficiências possam perceber, entender, navegar e interagir com sites e ferramentas online.";
      } else if (inputMessage.toLowerCase().includes('analisar')) {
        botResponse = "Para analisar um site, você pode usar a ferramenta 'Analisar URL' na barra lateral. Para analisar um arquivo HTML, use a opção 'Upload de HTML'.";
      }
      
      const newBotMessage = {
        sender: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
      
      // Auto read bot response if enabled
      if (autoRead) {
        TextToSpeech.speak(botResponse);
      }
    }, 1000);
  };

  // Handle keyboard submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Chat AssistAcess</h2>
        <button
          onClick={() => setAutoRead(!autoRead)}
          className={`flex items-center py-1 px-3 rounded-full text-sm transition-colors ${
            autoRead 
              ? 'bg-primary bg-opacity-20 text-primary' 
              : 'bg-background-secondary text-text-secondary'
          }`}
          aria-pressed={autoRead}
          aria-label={autoRead ? "Desativar leitura automática" : "Ativar leitura automática"}
        >
          {autoRead ? <FaVolumeUp className="mr-2" /> : <FaVolumeMute className="mr-2" />}
          {autoRead ? "Leitura automática" : "Leitura automática"}
        </button>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-2 sm:p-4 rounded-lg border border-border glass mb-4"
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions"
        aria-label="Histórico de mensagens"
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.sender === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
            role="article"
            aria-label={`Mensagem de ${message.sender === 'user' ? 'você' : 'assistente'}`}
          >
            <div className={`
              flex items-start gap-2 
              ${message.sender === 'user' ? 'flex-row-reverse' : ''}
            `}>
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                ${message.sender === 'user' 
                  ? 'bg-secondary bg-opacity-20 text-secondary' 
                  : 'bg-primary bg-opacity-20 text-primary'
                }
              `}>
                {message.sender === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
              </div>
              
              <div className={`
                relative px-4 py-2 rounded-lg
                ${message.sender === 'user' 
                  ? 'bg-secondary text-white' 
                  : 'bg-background-secondary dark:bg-background-alt'
                }
              `}>
                <div className={`
                  absolute top-2 w-3 h-3 rotate-45 
                  ${message.sender === 'user' 
                    ? 'right-[-6px] bg-secondary' 
                    : 'left-[-6px] bg-background-secondary dark:bg-background-alt'
                  }
                `}></div>
                <p>{message.content}</p>
                
                {message.sender === 'bot' && (
                  <div className="absolute -right-8 top-2">
                    <TextToSpeech 
                      text={message.content}
                      buttonType="icon"
                      buttonPosition="inline"
                      darkMode={darkMode}
                    />
                  </div>
                )}
                
                <div className="text-xs text-text-secondary mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-4 flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary bg-opacity-20 text-primary">
              <FaRobot size={14} />
            </div>
            <div className="relative px-4 py-2 rounded-lg bg-background-secondary dark:bg-background-alt">
              <div className="absolute top-2 left-[-6px] w-3 h-3 rotate-45 bg-background-secondary dark:bg-background-alt"></div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-300"></div>
              </div>
            </div>
            <div className="sr-only">AssistAcess está digitando...</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="relative glass rounded-lg border border-border p-2">
        <textarea
          ref={inputRef}
          rows="2"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem ou fale utilizando o microfone..."
          className="w-full p-3 pl-4 pr-24 bg-transparent resize-none focus:outline-none"
          aria-label="Digite sua mensagem"
        />
        
        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
          <VoiceControl
            onTranscriptChange={handleVoiceInput}
            buttonPosition="inline"
            language="pt-BR"
            darkMode={darkMode}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className={`p-2 rounded-full ${
              inputMessage.trim() 
                ? 'bg-primary text-white hover:bg-primary-dark' 
                : 'bg-background-secondary text-text-secondary cursor-not-allowed'
            }`}
            aria-label="Enviar mensagem"
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
        
        <p className="text-xs text-text-secondary mt-2">
          Pressione Enter para enviar. Shift + Enter para nova linha.
        </p>
      </div>
    </div>
  );
}

export default ChatInterface;