import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/orc': {
        target: 'https://fnorch0-k6xtyn322tr2i.azurewebsites.net',
        changeOrigin: true,
        secure: false
      },
      '/api/accesibilidad': {
        target: 'https://func-balab-dev-1.azurewebsites.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/accesibilidad/, '/api/orc')
      },
      '/api/turismo': {
        target: 'https://botiopenai-dzc8b7h9ebe5hqdu.a03.azurefd.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/turismo/, '/api/orc')
      },
      '/api/salesforce': {
        target: 'https://agenciasistemasdeinfogcba.my.salesforce.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/salesforce/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
        }
      },
      '/api/salesforce-api': {
        target: 'https://api.salesforce.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/salesforce-api/, '')
      }
    }
  }
})
