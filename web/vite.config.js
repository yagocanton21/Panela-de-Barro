import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true, // Necessário para Vite 6+ quando usado com proxy
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 80
    },
    // Dev nativo (sem nginx): espelha o proxy /api -> backend. Ignorado no build de prod.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
