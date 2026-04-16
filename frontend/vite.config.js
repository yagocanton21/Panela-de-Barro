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
      clientPort: 5173
    }
  },
})
