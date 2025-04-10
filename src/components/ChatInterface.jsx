// src/components/ChatInterface.jsx
import { useState } from 'react';

function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Olá! Sou o AssistAcess, seu assistente de acessibilidade. Posso analisar sites ou arquivos HTML, gerar relatórios de acessibilidade e responder dúvidas sobre WCAG. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Adiciona mensagem do usuário
    const userMessage = {
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simula resposta do bot
    setTimeout(() => {
      // Resposta simulada para demonstração
      let botResponse = "Estou processando sua solicitação...";
      
      if (inputMessage.toLowerCase().includes('wcag')) {
        botResponse = "WCAG (Web Content Accessibility Guidelines) são diretrizes que tornam o conteúdo da web mais acessível. A versão atual é WCAG 2.1 com níveis A, AA e AAA de conformidade.";
      } else if (inputMessage.toLowerCase().includes('acessibilidade')) {
        botResponse = "A acessibilidade web permite que pessoas com deficiências possam perceber, entender, navegar e interagir com sites e ferramentas online.";
      } else if (inputMessage.toLowerCase().includes('analisar')) {
        botResponse = "Para analisar um site, você pode usar a ferramenta 'Analisar URL' na barra lateral. Para analisar um arquivo HTML, use a opção 'Upload de HTML'.";
      }
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 rounded-l border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;