import { useState, useRef, useEffect } from 'react';
// import { sendMessageToAI, resetConversationId } from '../../services/aiService';
import Message from './Message';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { resetConversationId } from '../../services/aiService';
import { sendMessageToAI } from '../../services/aiService';

// Estilos para los switches y opciones
const switchStyles = {
  options: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    margin: '10px 0',
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '40px',
    height: '20px',
  },
  input: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    borderRadius: '34px',
    transition: '0.4s',
  },
  sliderChecked: {
    backgroundColor: '#2196F3',
  }
};

// Componente personalizado para el Switch
const Switch = ({ checked, onChange, disabled = false }) => {
  return (
    <label style={{
      ...switchStyles.switch,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}>
      <input 
        style={switchStyles.input}
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span style={{
        ...switchStyles.slider,
        ...(checked && switchStyles.sliderChecked),
        backgroundColor: disabled ? '#ccc' : checked ? '#2196F3' : '#ccc',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        <span style={{
          position: 'absolute',
          height: '16px',
          width: '16px',
          left: checked ? '22px' : '2px',
          bottom: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: '0.4s',
        }}></span>
      </span>
    </label>
  );
};

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [accesibilidad, setAccesibilidad] = useState(false);
  const [turismo, setTurismo] = useState(false);
  const [tramites, setTramites] = useState(true);
  const [salesforce, setSalesforce] = useState(false);

  const handleResetChat = () => {
    setMessages([]);
    resetConversationId();
    
    // Eliminamos la parte que restablece los switches
  };

  // Función para cambiar los switches asegurando que solo uno esté activo
  const handleSwitchChange = (switchName) => {
    // Si el switch está deshabilitado (como Turismo), no hacemos nada
    if (switchName === 'turismo') return;
    
    // Verificar si el switch que se ha clicado es el que ya está activo
    let isCurrentlyActive = false;
    
    switch(switchName) {
      case 'accesibilidad':
        isCurrentlyActive = accesibilidad;
        break;
      case 'turismo':
        isCurrentlyActive = turismo;
        break;
      case 'tramites':
        isCurrentlyActive = tramites;
        break;
      case 'salesforce':
        isCurrentlyActive = salesforce;
        break;
      default:
        break;
    }
    
    // Si el switch ya está activo, no hacemos nada y mantenemos su estado
    if (isCurrentlyActive) return;
    
    // Desactivar todos los switches
    setAccesibilidad(false);
    setTurismo(false);
    setTramites(false);
    setSalesforce(false);
    
    // Activar el switch seleccionado
    switch(switchName) {
      case 'accesibilidad':
        setAccesibilidad(true);
        break;
      case 'turismo':
        setTurismo(true);
        break;
      case 'tramites':
        setTramites(true);
        break;
      case 'salesforce':
        setSalesforce(true);
        break;
      default:
        break;
    }
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
    
    // Incluir el estado de los switches en el mensaje del usuario
    const userMessage = {
      role: 'human',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      metadata: {
        accesibilidad,
        turismo,
        tramites,
        salesforce
      }
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Enviar mensaje con la información de los switches
      const response = await sendMessageToAI(inputValue, {
        accesibilidad,
        turismo,
        tramites,
        salesforce
      });
      
      // Agregar respuesta de la IA con los metadatos
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
        flexWrap: 'wrap'
      }}>
        <h1 style={{ margin: '0' }}>LLM's BOTI</h1>        
        <div style={switchStyles.options}>
          <div style={switchStyles.optionItem}>
            <span>Accesibilidad</span>
            <Switch checked={accesibilidad} onChange={() => handleSwitchChange('accesibilidad')} />
          </div>
          
          
          
          <div style={switchStyles.optionItem}>
            <span>Tramites</span>
            <Switch checked={tramites} onChange={() => handleSwitchChange('tramites')} />
          </div>
          <div style={switchStyles.optionItem}>
            <span>Salesforce</span>
            <Switch checked={salesforce} onChange={() => handleSwitchChange('salesforce')} />
          </div>
          <div style={{
            ...switchStyles.optionItem,
            color: 'gray',
            cursor: 'not-allowed'
          }}>
            <span>Turismo</span>
            <Switch checked={turismo} onChange={() => handleSwitchChange('turismo')} disabled={true} />
          </div>
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
          // disabled={isLoading}
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
