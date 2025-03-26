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
      }
    }
  }
})
