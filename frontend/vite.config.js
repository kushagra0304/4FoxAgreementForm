import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    build: {
      outDir: '../backend/public', 
      emptyOutDir: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/oauth/callback': {
        target: 'http://localhost:10000',
        changeOrigin: true,
      }
    }
  },
})
