import axios from 'axios';

const chatClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 80000
});

let currentConversationId = '';

export const sendMessage = async (question, origin, routeTo = null) => {
  try {
    const body = { id: currentConversationId, trace_id: '', question, origin };
    if (routeTo !== null) body.route_to = routeTo;

    const response = await chatClient.post('/api/chat/', body);
    const data = response.data;
    console.log(data);

    if (data.id) currentConversationId = data.id;

    const messages = data.messages || [];
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');

    const route = data.outcome?.route;
    const fallback = route === 'out_of_scope'
      ? '[RESPUESTA INTERNA]: Pregunta fuera de alcance'
      : route ? `[DERIVADO] a ${route}` : '';
    return {
      content: lastAssistant?.content || fallback,
      metadata: {
        conversation_id: data.id,
        response_time: data.response_time,
        original_question: data.original_question,
        question: data.question,
        outcome: data.outcome
      },
      node_metadata: data.node_metadata
    };
  } catch (error) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    throw { statusCode, message: errorMessage, originalError: error };
  }
};

export const resetConversation = () => {
  currentConversationId = '';
};

export const getCurrentConversationId = () => currentConversationId;
