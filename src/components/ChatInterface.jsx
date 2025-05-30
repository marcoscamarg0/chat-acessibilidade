// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import TextToSpeech from './TextToSpeech';
import VoiceControl from './VoiceControl';
import { getBotResponse } from '../services/chatbotService'; // Importar o serviço
import { FaRobot, FaUser, FaPaperPlane, FaVolumeUp, FaVolumeMute, FaMicrophone } from 'react-icons/fa'; // Adicionado FaMicrophone se não estiver lá

function ChatInterface() {
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Olá! Sou o AssistAcess, seu assistente de acessibilidade. Posso analisar sites (usando PageSpeed Insights), responder dúvidas sobre WCAG com a ajuda da IA Gemini e mais. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceInput = (transcript) => {
    setInputMessage(transcript);
    // Opcional: enviar automaticamente após reconhecimento de voz
    // if (transcript) handleSendMessage(transcript); // Cuidado para não criar loop
  };

  const handleSendMessage = async (messageToSend = inputMessage) => { // Permite passar a mensagem diretamente
    const trimmedMessage = messageToSend.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      sender: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (messageToSend === inputMessage) { // Só limpa o input se a mensagem veio dele
        setInputMessage('');
    }
    setIsTyping(true);

    try {
      const botResponseText = await getBotResponse(trimmedMessage, 'chat'); // 'chat' é o activeTool

      const newBotMessage = {
        sender: 'bot',
        content: botResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMessage]);

      if (autoRead) {
        // Tenta usar o componente TextToSpeech.speak se ele for exposto dessa forma
        // ou usa a API nativa do navegador como fallback.
        // Para usar TextToSpeech.speak, o componente TextToSpeech precisaria
        // de um método estático ou ser instanciado de forma diferente.
        // Por simplicidade, vamos usar a API nativa aqui se o TextToSpeech não tiver um método estático speak.
        if (typeof window.speechSynthesis !== 'undefined' && SpeechSynthesisUtterance) {
            const utterance = new SpeechSynthesisUtterance(botResponseText);
            utterance.lang = 'pt-BR'; // Definir o idioma
            window.speechSynthesis.speak(utterance);
        } else if (TextToSpeech && typeof TextToSpeech.speak === 'function') {
            // Se você modificou TextToSpeech para ter um método estático:
            // TextToSpeech.speak(botResponseText, 'pt-BR');
        }
      }

    } catch (error) {
      console.error("Erro ao obter resposta do bot:", error);
      const errorBotMessage = {
        sender: 'bot',
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Verifique o console para detalhes.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus(); // Foca no input após enviar
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // O JSX do ChatInterface (return (...)) permanece o mesmo da sua versão anterior,
  // apenas certifique-se que os componentes VoiceControl e TextToSpeech
  // estejam corretamente integrados no JSX se você os utiliza.

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
          <FaRobot className="inline mr-2 mb-1" /> AssistAcess Chat
        </h2>
        <button
          onClick={() => setAutoRead(!autoRead)}
          className={`flex items-center py-1.5 px-3 rounded-full text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${
            autoRead 
              ? 'bg-primary text-white focus:ring-primary-dark' 
              : 'bg-background-secondary dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400'
          }`}
          aria-pressed={autoRead}
          aria-label={autoRead ? "Desativar leitura automática de mensagens do bot" : "Ativar leitura automática de mensagens do bot"}
        >
          {autoRead ? <FaVolumeUp className="mr-2" aria-hidden="true" /> : <FaVolumeMute className="mr-2" aria-hidden="true" />}
          <span>{autoRead ? "Leitura Ativa" : "Leitura Inativa"}</span>
        </button>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 rounded-lg border border-border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner mb-4"
        aria-live="polite" 
        aria-atomic="false"
        aria-relevant="additions text"
        id="chat-history"
        role="log"
        aria-label="Histórico de mensagens do chat"
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            role="article" // Cada mensagem é um artigo dentro do log
            aria-labelledby={`message-sender-${index}`}
            aria-describedby={`message-content-${index} message-timestamp-${index}`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%]`}>
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary bg-opacity-15 text-primary dark:bg-opacity-25 mb-4" aria-hidden="true">
                  <FaRobot size={16} />
                </div>
              )}
              <div className={`
                relative px-3.5 py-2.5 rounded-t-xl
                ${message.sender === 'user' 
                  ? 'bg-primary text-white rounded-l-xl' 
                  : 'bg-background-secondary dark:bg-gray-700 text-text dark:text-text-light rounded-r-xl'
                }
                shadow-md
              `}>
                {message.sender === 'bot' && (
                    <span id={`message-sender-${index}`} className="sr-only">Assistente diz:</span>
                )}
                {message.sender === 'user' && (
                    <span id={`message-sender-${index}`} className="sr-only">Você diz:</span>
                )}
                {/* Renderizar o conteúdo, tratando quebras de linha */}
                <p id={`message-content-${index}`} className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div id={`message-timestamp-${index}`} className="text-xs opacity-70 mt-1.5 text-right">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                 {/* Ícone de TTS para mensagens do bot */}
                 {message.sender === 'bot' && (
                  <div className="absolute -top-2 -right-2"> 
                    <TextToSpeech 
                      text={message.content}
                      buttonType="icon"
                      // buttonPosition="inline" // Ou ajuste conforme o design
                      darkMode={darkMode}
                      classNameForPositioning="p-1 bg-background-alt dark:bg-gray-600 rounded-full shadow" // Exemplo de classe para estilizar o botão TTS
                    />
                  </div>
                )}
              </div>
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary bg-opacity-15 text-secondary dark:bg-opacity-25 mb-4" aria-hidden="true">
                  <FaUser size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] justify-start">
             <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary bg-opacity-15 text-primary dark:bg-opacity-25 mb-4" aria-hidden="true">
                <FaRobot size={16} />
              </div>
            <div className="relative px-3.5 py-2.5 rounded-t-xl rounded-r-xl bg-background-secondary dark:bg-gray-700 text-text dark:text-text-light shadow-md">
              <div className="flex space-x-1.5 items-center h-5"> {/* Altura fixa para os pontos */}
                <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-light animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-light animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-light animate-bounce delay-300"></div>
              </div>
              <div className="sr-only" aria-live="assertive">AssistAcess está digitando...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-border dark:border-gray-600 p-2 shadow-md flex items-center gap-2">
        <textarea
          ref={inputRef}
          rows="1" // Começa com 1 linha, pode crescer
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            // Ajustar altura dinamicamente (opcional, requer mais lógica)
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="flex-grow p-2.5 pr-20 bg-transparent resize-none focus:outline-none text-sm text-text dark:text-text-light placeholder-gray-500 dark:placeholder-gray-400 max-h-24 overflow-y-auto" // max-h para limitar crescimento
          aria-label="Caixa de entrada de mensagem"
          style={{ scrollbarWidth: 'thin' }} // Estilo da barra de rolagem para Firefox
        />
        <div className="flex items-center">
          <VoiceControl
            onTranscriptChange={handleVoiceInput}
            buttonPosition="inline"
            language="pt-BR"
            darkMode={darkMode}
            // Adicione classes para estilizar o botão do VoiceControl se necessário
            // className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" 
          />
          <button
            onClick={() => handleSendMessage()} // Garante que chame com o inputMessage atual
            disabled={!inputMessage.trim() || isTyping}
            className={`p-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${
              (inputMessage.trim() && !isTyping)
                ? 'bg-primary text-white hover:bg-primary-dark focus:ring-primary-dark' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Enviar mensagem"
            title="Enviar mensagem"
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </div>
       <p className="text-xs text-text-secondary dark:text-gray-400 mt-2 text-center px-2">
          Pressione <kbd className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-xs">Enter</kbd> para enviar.
          Pressione <kbd className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-xs">Shift</kbd> + <kbd className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-xs">Enter</kbd> para nova linha.
       </p>
    </div>
  );
}

export default ChatInterface;