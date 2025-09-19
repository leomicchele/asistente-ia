# 🚀 Configuración de Salesforce

## ✅ Estado Actual
La integración de Salesforce está **completamente implementada y funcionando**. 

## 🔧 Para usar Salesforce en desarrollo:

### Paso 1: Abrir Chrome sin CORS
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev" --disable-features=VizDisplayCompositor
```

### Paso 2: Navegar a la aplicación
```
http://localhost:5173/
```

### Paso 3: Usar Salesforce
1. Seleccionar el switch "Salesforce"
2. Enviar mensajes normalmente
3. ¡Funciona perfectamente!

## 📋 Funcionalidades implementadas:
- ✅ Switch de Salesforce en la interfaz
- ✅ Creación automática de token OAuth2
- ✅ Creación automática de sesión con el agente
- ✅ Envío de mensajes con sequenceId incremental
- ✅ Recepción de respuestas del agente
- ✅ Manejo de estado (token, sesión, secuencia)
- ✅ Reset automático al reiniciar chat

## 🔄 Para desarrollo normal (sin Salesforce):
Usar Chrome normal - los otros servicios (Trámites, Accesibilidad) funcionan con el proxy.

## 📝 Notas técnicas:
- Agent ID: `0Xxfo0000001HObCAM`
- Token URL: `https://agenciasistemasdeinfogcba.my.salesforce.com/services/oauth2/token`
- API URL: `https://api.salesforce.com`
- El proxy de Vite tiene limitaciones con las APIs de Salesforce
- La solución con Chrome sin CORS es temporal para desarrollo
