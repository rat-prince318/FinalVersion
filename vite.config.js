import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'src', // 修正root路径，因为源代码直接在src目录下
  base: '/FinalVersion/', // GitHub Pages需要的基础路径，与仓库名匹配
  build: {
    outDir: '../docs',
    emptyOutDir: true
  },
  server: {
    port: process.env.PORT || 3000,  // 从环境变量读取端口，默认3000
    strictPort: false,              // 允许自动切换
    host: true,                     // 允许外部访问
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true
      }
    }
  }
})