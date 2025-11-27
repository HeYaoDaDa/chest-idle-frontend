import { fileURLToPath, URL } from 'node:url'

import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vueJsx(), UnoCSS()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['frontend', '.localhost'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('pinia')) {
              return 'pinia'
            }
            if (id.includes('vue-router') || id.includes('vue-i18n')) {
              return 'vue-routing'
            }
            if (id.includes('axios') || id.includes('loglevel')) {
              return 'utilities'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
