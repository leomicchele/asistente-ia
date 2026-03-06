import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://aca-orc-dev.happysmoke-87dca937.eastus2.azurecontainerapps.io',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
