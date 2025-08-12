import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'zustand'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000
  },
  // Asset handling
  assetsInclude: ['**/*.mp3', '**/*.gif'],
  // Development server
  server: {
    port: 3000,
    open: true
  },
  // Preview server
  preview: {
    port: 4173,
    open: true
  }
})