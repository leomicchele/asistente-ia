import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import botAvatar from '../../assets/boti-image-64.png';

const Message = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [mostrarRespuestaCompleta, setMostrarRespuestaCompleta] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRespuestaCompleta = () => {
    setMostrarRespuestaCompleta(!mostrarRespuestaCompleta);
  };

  const procesarTexto = (texto) => {
    // Reemplazar saltos de línea por <br>
    let textoFormateado = texto.replace(/\n/g, '<br />');

    // Procesar enlaces en formato Markdown: [texto](url)
    textoFormateado = textoFormateado.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
        
    return textoFormateado;
  };

  return (
    <div className={`message ${message.role === 'human' ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {message.role === 'human' ? '👤' : 
         <img src={botAvatar} alt="Bot Avatar" className="bot-avatar" />}
      </div>
      <div className="message-content">
        {/* <p>{message.content}</p> */}

        <p dangerouslySetInnerHTML={{ __html: procesarTexto(message.content) }}></p>
        {message.role === 'assistant' && (
          <>
            <button 
              className="copy-button" 
              onClick={copyToClipboard}
              aria-label="Copiar respuesta"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            {message.metadata && (
              <div className="message-metadata">
                {message.metadata.response_time && (
                  <span className="response-time">Tiempo de respuesta: {message.metadata.response_time.toFixed(2)}s</span>
                )}
                {message.metadata.conversation_id && (
                  <span className="conversation-id">ID: {message.metadata.conversation_id}</span>
                )}
                
                <button 
                  className="toggle-response-button"
                  onClick={toggleRespuestaCompleta}
                  aria-label={mostrarRespuestaCompleta ? "Ocultar respuesta completa" : "Mostrar respuesta completa"}
                >
                  {mostrarRespuestaCompleta ? 
                    <>Ocultar detalles <ChevronUp size={14} /></> : 
                    <>Ver detalles <ChevronDown size={14} /></>
                  }
                </button>
                
                {mostrarRespuestaCompleta && (
                  <div className="respuesta-completa">
                    <h4>Detalles del mensaje:</h4>
                    <div className="json-container">
                      {Object.entries(message).map(([key, value]) => (
                        key !== 'content' && (
                          <div key={key} className="json-item">
                            <strong>{key}:</strong> {
                              typeof value === 'object' 
                                ? <pre>{JSON.stringify(value, null, 2)}</pre>
                                : <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                            }
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Message; 