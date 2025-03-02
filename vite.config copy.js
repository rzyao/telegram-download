import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig({
  plugins: [
    vue(),
    ElementPlus({
      useSource: true
    })
  ],
  build: {
    outDir: path.resolve(__dirname, '1.0.3_0/dist'),
    rollupOptions: {
      input: './main.js',
      output: {
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});