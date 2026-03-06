import { useState, useRef, useEffect } from 'react';
import { sendMessage, resetConversation } from '../../services/aiService';
import Message from './Message';
import { Send, Loader2, RotateCcw } from 'lucide-react';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [origin, setOrigin] = useState('whatsapp');
  const [routeTo, setRouteTo] = useState(null);

  const handleResetChat = () => {
    setMessages([]);
    resetConversation();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'human',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(inputValue, origin, routeTo);

      const aiMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        metadata: response.metadata
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessages = {
        400: 'Error en la solicitud. Por favor, revisa tus datos. Status: 400',
        401: 'No autorizado. Verifica tus credenciales. Status: 401',
        403: 'Acceso prohibido. No tienes permiso para realizar esta acción. Status: 403',
        404: 'Recurso no encontrado. Status: 404',
        429: 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo. Status: 429',
        500: 'Error interno del servidor. Por favor, intenta más tarde. Status: 500',
        502: 'Servicio temporalmente no disponible. Intenta más tarde. Status: 502',
        503: 'Servicio no disponible. Por favor, intenta más tarde. Status: 503',
        504: 'Tiempo de espera agotado. Por favor, intenta más tarde. Status: 504'
      };

      const statusCode = err.statusCode || 0;
      const defaultMessage = 'Error al conectar con la IA. Por favor, intenta nuevamente.';

      setError(errorMessages[statusCode] || err.message || defaultMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container sticky-form">
      <header className="app-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h1 style={{ margin: '0' }}>LLM's BOTI</h1>

        <div className="header-controls">
          {/* Origin — radio, always one selected */}
          <fieldset className="control-group">
            <legend>Canal (origin)</legend>
            <div className="control-chips">
              {['whatsapp', 'webchat', 'bax'].map(value => (
                <span key={value} className="control-chip">
                  <input
                    type="radio"
                    id={`origin-${value}`}
                    name="origin"
                    value={value}
                    checked={origin === value}
                    onChange={() => setOrigin(value)}
                  />
                  <label htmlFor={`origin-${value}`}>{value}</label>
                </span>
              ))}
            </div>
          </fieldset>

          <div className="control-divider" />

          {/* Route To — optional exclusive checkbox (can uncheck all) */}
          <fieldset className="control-group">
            <legend>Ruta — opcional (route_to)</legend>
            <div className="control-chips">
              {['tramites', 'descubrir', 'accesibilidad'].map(value => (
                <span key={value} className="control-chip">
                  <input
                    type="checkbox"
                    id={`route-${value}`}
                    checked={routeTo === value}
                    onChange={() => setRouteTo(prev => prev === value ? null : value)}
                  />
                  <label htmlFor={`route-${value}`}>{value}</label>
                </span>
              ))}
            </div>
          </fieldset>
        </div>

        <button onClick={handleResetChat} aria-label="Reiniciar Chat" className="reset-chat-button">
          <RotateCcw size={20} />
          Reiniciar chat
        </button>
      </header>

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h2>Bienvenido al Asistente BOTI IA</h2>
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
