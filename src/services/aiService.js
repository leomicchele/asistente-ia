import axios from 'axios';

// Configuración de la API
const API_URL = '/api/orc';
const API_KEY = import.meta.env.VITE_API_KEY || '';

const aiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-functions-key': API_KEY
  }
});

// Variable para almacenar el ID de conversación
let currentConversationId = '';

const procesarTexto = (texto) => {
    console.log("texto",texto);
    // Reemplazar saltos de línea por <br>
    let textoFormateado = texto.replace(/\n/g, '<br />');
    console.log("textoFormateado",textoFormateado);

    return textoFormateado;
  };



// Función para enviar mensaje a la API
export const sendMessageToAI = async (message) => {
  try {
    const response = await aiClient.post('', {
      conversation_id: currentConversationId,
      question: message
    });

    // Actualizar el ID de conversación para la siguiente interacción
    if (response.data && response.data.conversation_id) {
      currentConversationId = response.data.conversation_id;
    }

    // Procesamos la respuesta para manejar correctamente etiquetas y emojis
    const processedContent = response.data.answer;

    // Devolver el objeto con el contenido formateado para el chat y los metadatos
    return {
      content: processedContent,
      metadata: {
        conversation_id: response.data.conversation_id,
        response_time: response.data.response_time,
        language: response.data.language,
        score: response.data.score
      },
      raw_response: response.data // Guardamos la respuesta completa por si se necesita
    };
  } catch (error) {
    console.error('Error al comunicarse con la API:', error);
    throw error;
  }
};

// Función para reiniciar la conversación
export const resetConversation = () => {
  currentConversationId = '';
};

// Función para reiniciar el ID de conversación
export const resetConversationId = () => {
  currentConversationId = '';
};

// Función para obtener el ID de conversación actual
export const getCurrentConversationId = () => {
  return currentConversationId;
};

// Configuración para OpenAI (alternativa)
export const setupOpenAI = () => {
  aiClient.defaults.baseURL = 'https://api.openai.com/v1/chat/completions';
  aiClient.defaults.headers['Authorization'] = `Bearer ${API_KEY}`;
  delete aiClient.defaults.headers['x-functions-key'];
};

// Función para enviar mensaje a OpenAI
export const sendMessageToOpenAI = async (messages) => {
  try {
    const response = await aiClient.post('', {
      model: 'gpt-4',
      messages: messages.map(msg => ({
        role: msg.role === 'human' ? 'user' : 'assistant',
        content: msg.content
      }))
    });
    return {
      content: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error al comunicarse con OpenAI:', error);
    throw error;
  }
};
