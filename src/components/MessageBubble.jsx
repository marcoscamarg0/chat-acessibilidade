function MessageBubble({ message }) {
    const { sender, content, timestamp } = message
    const isBot = sender === 'bot'
    
    const formattedTime = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
    
    return (
      <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
        <div 
          className={`max-w-3/4 p-3 rounded-lg ${
            isBot 
              ? 'bg-secondary text-white' 
              : 'bg-primary text-white'
          }`}
        >
          {isBot && (
            <div className="text-xs text-primary font-bold mb-1">
              AssistAcess
            </div>
          )}
          <div>{content}</div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {formattedTime}
          </div>
        </div>
      </div>
    )
  }
  
  export default MessageBubble