# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**SIEMPRE Responde en español**

## Commands

```bash
# Development
npm run dev          # Start Vite dev server with HMR and proxy routes

# Build & Preview
npm run build        # Production build
npm run preview      # Preview built app locally

# Lint
npm run lint         # Run ESLint
```

## Architecture

This is a **React + Vite** chatbot SPA that apunta a un único backend de IA. La UI es una interfaz de chat con controles dinámicos para parametrizar el request.

### Service / Backend

Un único endpoint:

| Endpoint | URL |
|----------|-----|
| Chat API | `POST https://aca-orc-dev.happysmoke-87dca937.eastus2.azurecontainerapps.io/api/chat/` |

### Request Body

```json
{
  "id": "",           // vacío en el primer mensaje; usar el id de la respuesta en los siguientes
  "trace_id": "",     // siempre vacío
  "question": "...",
  "origin": "whatsapp",   // requerido: "whatsapp" | "webchat" | "bax"
  "route_to": "tramites"  // opcional, omitir por defecto: "tramites" | "descubrir" | "accesibilidad"
}
```

### Key Files

- [src/services/aiService.js](src/services/aiService.js) — Cliente Axios único. Mantiene `conversationId` a nivel de módulo (vacío en primera interacción, luego persiste el `id` de la respuesta). Exporta `sendMessage(question, origin, routeTo)`, `resetConversation()` y `getCurrentConversationId()`.
- [src/components/Chat/ChatContainer.jsx](src/components/Chat/ChatContainer.jsx) — Componente principal: estado de `origin` (default `"whatsapp"`) y `routeTo` (default `null`), controles de chips en el header, envío de mensajes y manejo de errores.
- [src/components/Chat/Message.jsx](src/components/Chat/Message.jsx) — Renderizado de mensajes con botón de copia, badges de metadatos (`outcome.route`, `outcome.task`, `response_time`, `conversation_id`) y panel expandible con detalles en JSON.
- [src/components/Chat/Chat.css](src/components/Chat/Chat.css) — Estilos incluyendo `.control-group`, `.control-chip` y `.control-chips` para los controles del header.
- [vite.config.js](vite.config.js) — Dev proxy: `/api/chat` → Azure Container App.
- [vercel.json](vercel.json) — Solo headers CORS (sin rewrites).

### UI Controls (Header)

Dos grupos de chips en el header para parametrizar el request:

- **Canal (origin)** — radio, siempre uno seleccionado: `whatsapp` | `webchat` | `bax`
- **Ruta (route_to)** — checkbox exclusivo opcional, se puede deseleccionar todo (envía sin `route_to`): `tramites` | `descubrir` | `accesibilidad`

### Data Flow

1. Usuario escribe mensaje en `ChatContainer`
2. Se llama `sendMessage(question, origin, routeTo)` en `aiService.js`
3. El body incluye `id` (vacío o el de la conversación activa), `origin` y opcionalmente `route_to`
4. La respuesta actualiza `currentConversationId` con el `id` recibido
5. El texto de respuesta se extrae del último mensaje con `role: "assistant"` en `data.messages`
6. Respuesta + metadata renderizada en `Message.jsx`

### Proxy vs. Production

- **Local dev**: Vite proxy (`vite.config.js`) reenvía `/api/chat` al Azure Container App.
- **Production (Vercel)**: el browser llama directamente al Azure Container App URL (sin proxy Vercel). Si hubiera problemas de CORS, agregar un rewrite en `vercel.json`.

### Environment Variables

No se requieren variables de entorno para el funcionamiento básico. El endpoint es público y está hardcodeado en `aiService.js`.
