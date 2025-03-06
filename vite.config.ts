import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import terser from '@rollup/plugin-terser';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    plugins: [
      vue()
    ],
    // 如有需要，可在此处配置构建选项
    build: {
      outDir: './extension/js',
      sourcemap: isProd ? false : true,
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
          background: './src/background.js',
          content: './src/content.ts',
          popup: './src/popup.js',
          inject: './src/inject.ts',
          main: './main.js',
        },
        output: {
          format: 'es',
          entryFileNames: (chunkInfo) => {
            const mapping: Record<string, string> = {
              background: 'background.js',
              content: 'content.js',
              popup: 'popup.js',
              inject: 'inject.js',
              main: 'app.js',
            };
            return mapping[chunkInfo.name] || 'js/[name].js';
          },
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names[0] || '';
            if (fileName.endsWith('.css')) {
              return 'dist/[name][extname]';
            }
            return 'dist/[name].[hash][extname]';
          },
        },
        plugins: [
          isProd && terser(), // 启用 Terser 插件
        ]
      },
    },
  };
});
