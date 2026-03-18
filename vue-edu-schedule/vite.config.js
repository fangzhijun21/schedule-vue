import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    open: true,
    cors: true,
    proxy: {
      // 关键修正：匹配 /schedule 开头的请求（和后端上下文路径一致）
      '/schedule': {
        target: 'http://localhost:8080', // 后端基础地址（不带上下文路径）
        changeOrigin: true, // 开启跨域
        // 不做路径重写！因为后端本身就需要 /schedule 上下文路径
        rewrite: (path) => '/schedule' + path,
      },
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})
