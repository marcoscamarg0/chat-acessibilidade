import React from 'react';

function ChatMessage({ message, onViewReport, onViewWcagGuide }) {
  const { text, sender, timestamp, showReportButton, showWcagGuideButton } = message;
  
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
  
  return (
    <div className={`chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        <div className="message-header">
          <span className="sender">{sender === 'user' ? 'Você' : 'AssistAcess'}</span>
          <span className="timestamp">{formattedTime}</span>
        </div>
        <div className="message-text">
          {text}
        </div>
        <div className="message-actions">
          {showReportButton && (
            <button className="view-report-button" onClick={onViewReport}>
              Ver Relatório Detalhado
            </button>
          )}
          {showWcagGuideButton && (
            <button className="view-wcag-guide-button" onClick={onViewWcagGuide}>
              Abrir Guia WCAG
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;