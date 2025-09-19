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

// Configuración de Salesforce - URLs directas (requiere Chrome sin CORS)
const SALESFORCE_TOKEN_URL = 'https://agenciasistemasdeinfogcba.my.salesforce.com/services/oauth2/token';
const SALESFORCE_API_URL = 'https://api.salesforce.com';
const SALESFORCE_CLIENT_ID = '3MVG9XDDwp5wgbs3hS4t3phI9KCs0K9_Fl8Z3OW9eWPiZ8OiYAXBEhZzbSovMv_EUOrS1ieFP.Rl88hAvxbdj';
const SALESFORCE_CLIENT_SECRET = '31D6107CC8F06301F27E1E50A2C9E51D5A2DB90BF2A8830CEFB1136BD2B7BAAF';
const SALESFORCE_AGENT_ID = '0Xxfo0000001HObCAM';

// Cliente específico para Salesforce
const salesforceClient = axios.create({
  timeout: 30000
});

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

// Variables para Salesforce
let salesforceAccessToken = '';
let salesforceSessionId = '';
let salesforceSequenceId = 1;

// Función para enviar mensaje a la API
export const sendMessageToAI = async (message, metadata = {}) => {
  try {
    let response;
    
    // Seleccionar el cliente y el ID de conversación según el switch activo
    if (metadata.tramites) {
      // Usar el cliente por defecto (trámites)
      response = await aiClient.post('', {
        conversation_id: currentConversationId,
        question: message,
        metadata: {
          accesibilidad: metadata.accesibilidad || false,
          turismo: metadata.turismo || false,
          tramites: metadata.tramites || true
        }
      });
      
      // Actualizar el ID de conversación principal
      if (response.data && response.data.conversation_id) {
        currentConversationId = response.data.conversation_id;
      }
    } else if (metadata.accesibilidad) {
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
    } else if (metadata.salesforce) {
      // Usar Salesforce
      return await sendMessageToSalesforce(message);
    } else {
      // Si ningún switch está activo, usar trámites por defecto
      response = await aiClient.post('', {
        conversation_id: currentConversationId,
        question: message,
        metadata: {
          accesibilidad: false,
          turismo: false,
          tramites: true
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
  // Reiniciar también Salesforce
  salesforceAccessToken = '';
  salesforceSessionId = '';
  salesforceSequenceId = 1;
};

// Función para reiniciar el ID de conversación
export const resetConversationId = () => {
  currentConversationId = '';
  accesibilidadConversationId = '';
  turismoConversationId = '';
  // Reiniciar también Salesforce
  salesforceAccessToken = '';
  salesforceSessionId = '';
  salesforceSequenceId = 1;
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
// Función para generar UUID para Salesforce
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Función para crear token de Salesforce
const createSalesforceToken = async () => {
  try {
    console.log('🔐 Iniciando creación de token de Salesforce...');
    console.log('📍 URL:', SALESFORCE_TOKEN_URL);
    console.log('🔑 Client ID:', SALESFORCE_CLIENT_ID);
    
    const requestData = new URLSearchParams({
      'grant_type': 'client_credentials',
      'client_id': SALESFORCE_CLIENT_ID,
      'client_secret': SALESFORCE_CLIENT_SECRET
    });
    
    console.log('📤 Datos de la request:', requestData.toString());
    
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'BrowserId=LHGpyJM9EfCcIR2D6t97xw; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1'
      },
      timeout: 30000 // 30 segundos de timeout
    };
    
    console.log('📋 Headers:', config.headers);
    
    const response = await salesforceClient.post(SALESFORCE_TOKEN_URL, requestData, config);
    
    console.log('✅ Token creado exitosamente');
    console.log('📊 Status:', response.status);
    console.log('🎯 Response data keys:', Object.keys(response.data));
    
    salesforceAccessToken = response.data.access_token;
    console.log('🔐 Token guardado (primeros 20 chars):', salesforceAccessToken?.substring(0, 20) + '...');
    
    return salesforceAccessToken;
  } catch (error) {
    console.error('❌ Error al crear token de Salesforce:');
    console.error('🔍 Error type:', error.constructor.name);
    console.error('📝 Error message:', error.message);
    
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📋 Response headers:', error.response.headers);
      console.error('📄 Response data:', error.response.data);
    } else if (error.request) {
      console.error('📡 Request made but no response received');
      console.error('🌐 Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    } else {
      console.error('⚙️ Error setting up request:', error.message);
    }
    
    throw error;
  }
};

// Función para crear sesión de Salesforce
const createSalesforceSession = async () => {
  try {
    console.log('🎯 Iniciando creación de sesión de Salesforce...');
    
    if (!salesforceAccessToken) {
      console.log('🔐 No hay token, creando uno nuevo...');
      await createSalesforceToken();
    } else {
      console.log('✅ Token existente encontrado');
    }
    
    const sessionUrl = `${SALESFORCE_API_URL}/einstein/ai-agent/v1/agents/${SALESFORCE_AGENT_ID}/sessions`;
    const externalSessionKey = generateUUID();
    
    console.log('📍 Session URL:', sessionUrl);
    console.log('🤖 Agent ID usado:', SALESFORCE_AGENT_ID);
    console.log('🆔 External Session Key:', externalSessionKey);
    console.log('🔐 Token disponible (primeros 50 chars):', salesforceAccessToken?.substring(0, 50) + '...');
    
    // Vamos a probar también una URL alternativa sin agent específico
    const alternativeUrl = `${SALESFORCE_API_URL}/einstein/ai-agent/v1/sessions`;
    console.log('🔄 URL alternativa (sin agent):', alternativeUrl);
    
    const requestBody = {
      "externalSessionKey": externalSessionKey,
      "instanceConfig": {
        "endpoint": "https://agenciasistemasdeinfogcba.my.salesforce.com"
      },
      "streamingCapabilities": {
        "chunkTypes": ["Text"]
      },
      "bypassUser": true
    };
    
    // También probemos sin algunos parámetros opcionales
    const simpleRequestBody = {
      "externalSessionKey": externalSessionKey,
      "instanceConfig": {
        "endpoint": "https://agenciasistemasdeinfogcba.my.salesforce.com"
      }
    };
    
    console.log('📤 Request body completo:', JSON.stringify(requestBody, null, 2));
    console.log('📤 Request body simple:', JSON.stringify(simpleRequestBody, null, 2));
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    // Usar la URL original con el Agent ID (como en Postman)
    console.log('🔄 Usando URL con Agent ID (como Postman)...');
    const response = await salesforceClient.post(sessionUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${salesforceAccessToken}`,
        'Cookie': 'BrowserId=u8VeUZMMEfCMbrcnyD0_Fg'
      }
    });
    
    console.log('✅ Sesión creada exitosamente');
    console.log('📊 Status:', response.status);
    console.log('🎯 Response data keys:', Object.keys(response.data));
    
    salesforceSessionId = response.data.sessionId;
    salesforceSequenceId = 1; // Reiniciar secuencia para nueva sesión
    
    console.log('🆔 Session ID guardado:', salesforceSessionId);
    console.log('🔢 Sequence ID reiniciado a:', salesforceSequenceId);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear sesión de Salesforce:');
    console.error('🔍 Error type:', error.constructor.name);
    console.error('📝 Error message:', error.message);
    
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📋 Response headers:', error.response.headers);
      console.error('📄 Response data:', error.response.data);
    } else if (error.request) {
      console.error('📡 Request made but no response received');
      console.error('🌐 Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }
    
    throw error;
  }
};

// Función para enviar mensaje a Salesforce
const sendMessageToSalesforce = async (message) => {
  try {
    console.log('💬 Enviando mensaje a Salesforce:', message);
    
    // Verificar si tenemos token y sesión
    if (!salesforceAccessToken) {
      console.log('🔐 No hay token, creando uno nuevo...');
      await createSalesforceToken();
    }
    
    if (!salesforceSessionId) {
      console.log('🎯 No hay sesión, creando una nueva...');
      await createSalesforceSession();
    }
    
    console.log('🆔 Session ID disponible:', salesforceSessionId);
    console.log('🌐 SALESFORCE_API_URL:', SALESFORCE_API_URL);
    
    const messageUrl = `${SALESFORCE_API_URL}/einstein/ai-agent/v1/sessions/${salesforceSessionId}/messages`;
    console.log('📍 Message URL construida:', messageUrl);
    console.log('🔢 Sequence ID actual:', salesforceSequenceId);
    
    const requestBody = {
      "message": {
        "sequenceId": salesforceSequenceId,
        "type": "Text",
        "text": message
      }
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await salesforceClient.post(messageUrl, requestBody, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${salesforceAccessToken}`,
        'Cookie': 'BrowserId=LHGpyJM9EfCcIR2D6t97xw; BrowserId=u8VeUZMMEfCMbrcnyD0_Fg'
      }
    });
    
    console.log('✅ Mensaje enviado exitosamente');
    console.log('📊 Status:', response.status);
    console.log('🎯 Response data keys:', Object.keys(response.data));
    
    // Incrementar el sequenceId para el próximo mensaje
    salesforceSequenceId++;
    console.log('🔢 Sequence ID incrementado a:', salesforceSequenceId);
    
    // Extraer el mensaje de la respuesta
    console.log('📄 Response completa:', JSON.stringify(response.data, null, 2));
    
    let aiMessage = 'No se recibió respuesta del agente';
    
    if (response.data.messages && response.data.messages.length > 0) {
      const firstMessage = response.data.messages[0];
      console.log('📨 Primer mensaje:', JSON.stringify(firstMessage, null, 2));
      
      aiMessage = firstMessage.message || firstMessage.text || 'Mensaje sin contenido';
    }
    
    console.log('🤖 Respuesta del agente:', aiMessage);
    
    return {
      content: aiMessage,
      metadata: {
        sessionId: salesforceSessionId,
        sequenceId: salesforceSequenceId - 1, // El que se usó para este mensaje
        feedbackId: response.data.messages[0]?.feedbackId,
        planId: response.data.messages[0]?.planId,
        isContentSafe: response.data.messages[0]?.isContentSafe
      },
      raw_response: response.data
    };
  } catch (error) {
    console.error('❌ Error al enviar mensaje a Salesforce:');
    console.error('🔍 Error type:', error.constructor.name);
    console.error('📝 Error message:', error.message);
    
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📋 Response headers:', error.response.headers);
      console.error('📄 Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('🌐 Request URL:', error.config?.url);
      console.error('📤 Request data:', error.config?.data);
    } else if (error.request) {
      console.error('📡 Request made but no response received');
      console.error('🌐 Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }
    
    // Si hay error de autenticación, intentar renovar token
    if (error.response?.status === 401) {
      console.log('🔄 Error 401, limpiando credenciales...');
      salesforceAccessToken = '';
      salesforceSessionId = '';
      throw {
        statusCode: 401,
        message: 'Error de autenticación con Salesforce. Intenta nuevamente.',
        originalError: error
      };
    }
    
    throw {
      statusCode: error.response?.status,
      message: error.response?.data?.message || error.message,
      originalError: error
    };
  }
};

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
