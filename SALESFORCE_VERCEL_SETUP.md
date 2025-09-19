# Configuración de Salesforce en Vercel

## Problema Resuelto

El error 403 al obtener el token de Salesforce en Vercel se debe a que **Salesforce no permite requests directos desde el frontend** por políticas de CORS y seguridad. En desarrollo local funciona porque el proxy de Vite maneja las requests, pero en Vercel necesitamos usar **Serverless Functions**.

## Solución Implementada

### 1. Serverless Functions Creadas

- **`/api/salesforce-token.js`**: Maneja la obtención del token OAuth2 de Salesforce
- **`/api/salesforce-api.js`**: Actúa como proxy para todas las requests a la API de Salesforce

### 2. Cambios en el Código

- **`aiService.js`**: Actualizado para usar las nuevas rutas de las Serverless Functions
- **`vercel.json`**: Modificado para evitar conflictos con las rutas de Salesforce

### 3. Variables de Entorno Requeridas en Vercel

Asegúrate de configurar estas variables en tu dashboard de Vercel:

```
VITE_SALESFORCE_CLIENT_ID=tu_client_id_aqui
VITE_SALESFORCE_CLIENT_SECRET=tu_client_secret_aqui
VITE_SALESFORCE_AGENT_ID=tu_agent_id_aqui
```

## Configuración en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega las tres variables mencionadas arriba
4. Redeploy tu aplicación

## Flujo de Funcionamiento

1. **Frontend** → `/api/salesforce-token` (Serverless Function)
2. **Serverless Function** → Salesforce OAuth2 endpoint
3. **Salesforce** → Devuelve token
4. **Frontend** → `/api/salesforce-api` (Serverless Function) con token
5. **Serverless Function** → Salesforce API con token válido

## Ventajas de esta Solución

- ✅ **Seguridad**: Las credenciales de Salesforce nunca se exponen al frontend
- ✅ **CORS**: Las Serverless Functions actúan como proxy, evitando problemas de CORS
- ✅ **Compatibilidad**: Funciona tanto en desarrollo local como en producción
- ✅ **Escalabilidad**: Las Serverless Functions se escalan automáticamente

## Debugging

Si tienes problemas:

1. Verifica que las variables de entorno estén configuradas en Vercel
2. Revisa los logs de las Serverless Functions en Vercel Dashboard
3. Asegúrate de que las credenciales de Salesforce sean válidas
4. Verifica que el Agent ID sea correcto

## Estructura de Archivos

```
/api/
  ├── salesforce-token.js    # Obtención de token OAuth2
  └── salesforce-api.js      # Proxy para API de Salesforce
/src/services/
  └── aiService.js           # Cliente actualizado
vercel.json                  # Configuración de Vercel
.env.example                 # Variables de entorno de ejemplo
```
