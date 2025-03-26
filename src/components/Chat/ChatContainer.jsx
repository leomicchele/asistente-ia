import { useState, useRef, useEffect } from 'react';
// import { sendMessageToAI, resetConversationId } from '../../services/aiService';
import Message from './Message';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { resetConversationId } from '../../services/aiService';
import { sendMessageToAI } from '../../services/aiService';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const handleResetChat = () => {
    setMessages([]);
    resetConversationId();
  };

  // Función para desplazarse al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Efecto para desplazarse al final cuando se añaden nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Manejar el envío de mensajes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage = {
      role: 'human',
      content: inputValue
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Enviar solo el mensaje actual a la API
      const response = await sendMessageToAI(inputValue);
      
      // Agregar respuesta de la IA con los metadatos
      const aiMessage = {
        role: 'assistant',
        content: response.content,
        metadata: response.metadata
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError('Error al conectar con la IA. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container sticky-form">
      <header className="app-header">
        <h1>{import.meta.env.VITE_NOMBRE_TITULO || "Asistente IA"}</h1>
        <button onClick={handleResetChat} aria-label="Reiniciar Chat" className="reset-chat-button">
          <RotateCcw size={20} />
          Reiniciar chat
        </button>
      </header>
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h2>Bienvenido al {import.meta.env.VITE_NOMBRE_TITULO || "Asistente IA"}</h2>
            <p>¿En qué puedo ayudarte hoy?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={index} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="loading-message">
            <Loader2 className="animate-spin" size={20} />
            <span>Pensando...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputValue.trim()}
          aria-label="Enviar mensaje"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
