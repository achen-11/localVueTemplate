import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: './',
  server: {
    proxy: {
      '/api': {
        target: process.env.KOOBOO_SITE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        // 基本可以直接转发，cookie 和 header 如需自定义可在 configure 里设置
        // ws: false // 如有 WebSocket 需求可加上
        // secure: false // 本地调试方便时可禁用 SSL 校验
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.names?.[0] || ''
          if (info.endsWith('.css')) {
            return '[name].css'
          }
          return '[name][extname]'
        }
      }
    }
  }
})
