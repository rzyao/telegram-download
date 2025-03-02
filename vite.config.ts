import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 如有需要，可在此处配置构建选项
  build: {
    outDir: 'extension/js',
    sourcemap: true,
    rollupOptions: {
      // 定义多入口配置
      input: {
        background: 'src/background.js',
        content: 'src/content.ts',
        popup: 'src/popup.js',
        inject: 'src/inject.js',
        main: 'src/main.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const mapping: Record<string, string> = {
            background: 'js/background.js',
            content: 'js/content.js',
            popup: 'js/popup.js',
            inject: 'js/inject.js',
            main: 'js/app.js'
          }
          return mapping[chunkInfo.name] || 'js/[name].js'
        }
      }
    }
  }
}) 