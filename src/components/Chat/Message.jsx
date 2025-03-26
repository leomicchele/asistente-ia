import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const Message = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const procesarTexto = (texto) => {
    console.log("texto",texto);
    // Reemplazar saltos de línea por <br>
    let textoFormateado = texto.replace(/\n/g, '<br />');

    // Procesar enlaces en formato Markdown: [texto](url)
    textoFormateado = textoFormateado.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    console.log("textoFormateado",textoFormateado);
       
    return textoFormateado;
  };

  return (
    <div className={`message ${message.role === 'human' ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {message.role === 'human' ? '👤' : '🤖'}
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Message; 