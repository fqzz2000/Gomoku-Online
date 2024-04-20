import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      vue: '@vue/compat',
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2
          }
        }
      }
    }),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8131', 
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/public": {
        target: "http://localhost:8131",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/public/, '')
      },
      "/login/oidc": {
        target: 'http://localhost:8131',
        changeOrigin: true,
       // rewrite: path => path.replace(/^\/login\/oidc/, '/login/oidc')
      },
      '/game': {
        target: 'http://localhost:8181', 
        changeOrigin: true,
        ws: true, 
      },
     
    }
  },
  
})
