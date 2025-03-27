import axios from 'axios';

// Configuración de la API
const API_URL = '/api/orc';
const VITE_TRAMITES_API_KEY = import.meta.env.VITE_TRAMITES_API_KEY || '';

// Configuración de la API de accesibilidad
const ACCESIBILIDAD_API_URL = '/api/accesibilidad';
const ACCESIBILIDAD_API_KEY = import.meta.env.VITE_ACCESIBILIDAD_API_KEY;

// Configuración de la API de turismo
const TURISMO_API_URL = '/api/turismo';
const TURISMO_API_KEY = import.meta.env.VITE_TURISMO_API_KEY;

// Cliente principal
const aiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-functions-key': VITE_TRAMITES_API_KEY
  },
  timeout: 80000
});

// Cliente para accesibilidad
const accesibilidadClient = axios.create({
  baseURL: ACCESIBILIDAD_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-functions-key': ACCESIBILIDAD_API_KEY
  },
  timeout: 80000
});

// Cliente para turismo
const turismoClient = axios.create({
  baseURL: TURISMO_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-functions-key': TURISMO_API_KEY,
    'key': TURISMO_API_KEY
  },
  timeout: 80000
});

// Variables para almacenar los IDs de conversación
let currentConversationId = '';
let accesibilidadConversationId = '';
let turismoConversationId = '';

// Función para enviar mensaje a la API
export const sendMessageToAI = async (message, metadata = {}) => {
  try {
    let response;
    
    // Seleccionar el cliente y el ID de conversación según el switch activo
    if (metadata.accesibilidad) {
      // Usar el cliente de accesibilidad
      response = await accesibilidadClient.post('', {
        conversation_id: accesibilidadConversationId,
        question: message
      });
      
      // Actualizar el ID de conversación de accesibilidad
      if (response.data && response.data.conversation_id) {
        accesibilidadConversationId = response.data.conversation_id;
      }
    } else if (metadata.turismo) {
      // Usar el cliente de turismo
      response = await turismoClient.post('', {
        conversation_id: turismoConversationId,
        question: message
      });
      
      // Actualizar el ID de conversación de turismo
      if (response.data && response.data.conversation_id) {
        turismoConversationId = response.data.conversation_id;
      }
    } else {
      // Usar el cliente por defecto (trámites)
      response = await aiClient.post('', {
        conversation_id: currentConversationId,
        question: message,
        metadata: {
          accesibilidad: metadata.accesibilidad || false,
          turismo: metadata.turismo || false,
          tramites: metadata.tramites || false
        }
      });
      
      // Actualizar el ID de conversación principal
      if (response.data && response.data.conversation_id) {
        currentConversationId = response.data.conversation_id;
      }
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
        score: response.data.score,
        answer: response.data.answer || "",
        data_points: response.data.data_points || "No hay datos",
        thoughts: response.data.thoughts || "No hay procesamiento",
        // Incluimos los metadatos enviados para mantener coherencia
        // accesibilidad: metadata.accesibilidad || false,
        // turismo: metadata.turismo || false,
        // tramites: metadata.tramites || false
      },
      raw_response: response.data // Guardamos la respuesta completa por si se necesita
    };
  } catch (error) {
    console.error('Error al comunicarse con la API:', error);
    
    // Capturar el código de estado HTTP si está disponible
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    throw {
      statusCode,
      message: errorMessage,
      originalError: error
    };
  }
};

// Función para reiniciar la conversación
export const resetConversation = () => {
  currentConversationId = '';
  accesibilidadConversationId = '';
  turismoConversationId = '';
};

// Función para reiniciar el ID de conversación
export const resetConversationId = () => {
  currentConversationId = '';
  accesibilidadConversationId = '';
  turismoConversationId = '';
};

// Función para obtener el ID de conversación actual
export const getCurrentConversationId = () => {
  return currentConversationId;
};

// Configuración para OpenAI (alternativa)
export const setupOpenAI = () => {
  aiClient.defaults.baseURL = 'https://api.openai.com/v1/chat/completions';
  aiClient.defaults.headers['Authorization'] = `Bearer ${VITE_TRAMITES_API_KEY}`;
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
