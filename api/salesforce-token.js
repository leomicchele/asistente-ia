export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔐 Iniciando obtención de token de Salesforce...');
    
    const { grant_type, client_id, client_secret } = req.body;
    
    // Validar que tenemos todos los parámetros necesarios
    if (!grant_type || !client_id || !client_secret) {
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos: grant_type, client_id, client_secret' 
      });
    }

    // Crear los datos para el request
    const tokenData = new URLSearchParams({
      grant_type,
      client_id,
      client_secret
    });

    console.log('📤 Enviando request a Salesforce...');
    console.log('🌐 URL:', 'https://agenciasistemasdeinfogcba.my.salesforce.com/services/oauth2/token');

    // Hacer el request a Salesforce
    const response = await fetch('https://agenciasistemasdeinfogcba.my.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenData.toString()
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return res.status(response.status).json({ 
        error: 'Error al obtener token de Salesforce',
        details: errorText,
        status: response.status
      });
    }

    const tokenResponse = await response.json();
    console.log('✅ Token obtenido exitosamente');
    
    return res.status(200).json(tokenResponse);

  } catch (error) {
    console.error('❌ Error en serverless function:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
