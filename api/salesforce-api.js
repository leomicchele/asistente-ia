export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('🚀 Salesforce API Proxy - Método:', req.method);
    console.log('📍 URL solicitada:', req.url);
    
    // Extraer el path después de /api/salesforce-api
    const path = req.url.replace('/api/salesforce-api', '');
    const targetUrl = `https://api.salesforce.com${path}`;
    
    console.log('🎯 Target URL:', targetUrl);
    console.log('📋 Headers recibidos:', JSON.stringify(req.headers, null, 2));
    console.log('📤 Body recibido:', JSON.stringify(req.body, null, 2));

    // Preparar headers para el request a Salesforce
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Pasar el Authorization header si está presente
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    console.log('📋 Headers para Salesforce:', JSON.stringify(headers, null, 2));

    // Configurar el request
    const requestConfig = {
      method: req.method,
      headers
    };

    // Agregar body si no es GET
    if (req.method !== 'GET' && req.body) {
      requestConfig.body = JSON.stringify(req.body);
    }

    console.log('📤 Request config:', JSON.stringify(requestConfig, null, 2));

    // Hacer el request a Salesforce
    const response = await fetch(targetUrl, requestConfig);
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    // Obtener el contenido de la respuesta
    const responseText = await response.text();
    console.log('📄 Response text:', responseText);

    // Intentar parsear como JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    // Devolver la respuesta con el mismo status code
    return res.status(response.status).json(responseData);

  } catch (error) {
    console.error('❌ Error en Salesforce API proxy:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      stack: error.stack
    });
  }
}
