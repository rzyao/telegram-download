import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import terser from '@rollup/plugin-terser';
import path from 'path';
import copy from 'rollup-plugin-copy'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const customDir = path.join(__dirname, 'src');
  return {
    plugins: [
      vue(),
    ],
    server: {
      port: 3000,
      open: 'iframe/iframe.html',
    },
    // 如有需要，可在此处配置构建选项
    build: {
      outDir: './extension',
      emptyOutDir: true,
      sourcemap: isProd ? false : 'hidden',
      minify: isProd ? 'terser' : false,
      terserOptions: {
        compress: {
          pure_funcs: ['console.log'], // 要移除的函数
          drop_console: false,    // 是否移除所有 console
          drop_debugger: true,    // 移除 debugger
          keep_classnames: false, // 不保留类名
          keep_fnames: false      // 不保留函数名
        },
        mangle: {
          toplevel: true,         // 混淆顶级变量
          keep_classnames: false,
          keep_fnames: false
        },
        format: {
          comments: 'all'         // 移除注释
        }
      },
      rollupOptions: {
        // 定义多入口配置
        input: {
          background: './src/js/background.js',
          content: path.resolve(customDir, 'js/content.ts'),
          inject: path.resolve(customDir, 'js/inject.ts'),
          popupjs: path.resolve(customDir, 'js/popup.js'),
          main: path.resolve(customDir, 'iframe/iframe.js'),
        },
        output: {
          format: 'es',
          entryFileNames: (chunkInfo) => {
            const mapping: Record<string, string> = {
              background: 'js/background.js',
              content: 'js/content.js',
              popupjs: 'js/popup.js',
              inject: 'js/inject.js',
              main: 'iframe/iframe.js',
            };
            return mapping[chunkInfo.name] || 'js/[name].js';
          },
          assetFileNames: (assetInfo) => {
            const fileName = path.basename(assetInfo.names[0] || 'asset');
            if (fileName.endsWith('.css')) {
              return 'assets/[name][extname]';
            }
            return 'assets/[name][extname]';
          }
        },
        plugins: [
          isProd && terser(), // 启用 Terser 插件
          copy({
            targets: [
              {
                src: './src/iframe/iframe.html',
                dest: './extension/iframe'
              },
              {
                src: './src/popup/popup.html',
                dest: './extension/popup'
              },
              {
                src: './src/assets/',
                dest: './extension'
              },
              {
                src: './src/css/',
                dest: './extension'
              },
              {
                src: './src/fonts/',
                dest: './extension'
              },
              {
                src: './src/manifest.json',
                dest: './extension'
              },
              {
                src: './src/_locales/',
                dest: './extension'
              }
            ],
            verbose: true,
            hook: 'writeBundle'
          })
        ]
      },
    },
  };
});
