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
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8131', // 后端服务器地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/public": {
        target: "http://localhost:8131",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/public/, '')
      }
    }
  },
})
