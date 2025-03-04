import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 如有需要，可在此处配置构建选项
  build: {
    outDir: './extension/js',
    sourcemap: true,
    rollupOptions: {
      // 定义多入口配置
      input: {
        background: './src/background.js',
        content: './src/content.ts',
        popup: './src/popup.js',
        inject: './src/inject.ts',
        main: './main.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const mapping: Record<string, string> = {
            background: 'background.js',
            content: 'content.js',
            popup: 'popup.js',
            inject: 'inject.js',
            main: 'app.js'
          }
          return mapping[chunkInfo.name] || 'js/[name].js'
        },
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.names[0] || '';
          if (fileName.endsWith('.css')) {
            return 'dist/[name][extname]';
          }
          return 'dist/[name].[hash][extname]';
        }
      }
    }
  }
}) 