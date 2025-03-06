import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  return {
    plugins: [vue()],
    build: {
      outDir: './extension/js',
      sourcemap: isProd ? false : true,
      minify: isProd ? 'esbuild' : false,
      esbuildOptions: {
        pure: ['log.info'],
      },
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
          format: 'es',
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
        },
        plugins: [
          isProd && obfuscator({
            exclude: [
              /node_modules/,
              /\/element-plus\//,
              /\/vue\//
            ],
            options: {
              compact: true,//压缩代码
              controlFlowFlattening: false,//控制流扁平化
              deadCodeInjection: false,//删除无用代码
              debugProtection: false,//调试保护
              debugProtectionInterval: 0,//调试保护间隔
              disableConsoleOutput: false,//禁用控制台输出
              identifierNamesGenerator: 'mangled',//标识符名称生成器
              log: false,//日志
              numbersToExpressions: false,//数字转换为表达式
              renameGlobals: false,//重命名全局变量
              selfDefending: false,//自防御
              simplify: true,//简化代码
              splitStrings: false,//分割字符串
              stringArray: true,//字符串数组
              stringArrayCallsTransform: false,//字符串数组调用转换
              stringArrayCallsTransformThreshold: 0.5,//字符串数组调用转换阈值
              stringArrayEncoding: [],//字符串数组编码
              stringArrayIndexShift: true,//字符串数组索引移位
              stringArrayRotate: true,//字符串数组旋转
              stringArrayShuffle: true,//字符串数组打乱
              stringArrayWrappersCount: 1,//字符串数组包装器计数
              stringArrayWrappersChainedCalls: true,//字符串数组包装器链式调用
              stringArrayWrappersParametersMaxCount: 2,//字符串数组包装器参数最大计数
              stringArrayWrappersType: 'variable',//字符串数组包装器类型
              stringArrayThreshold: 0.75,//字符串数组阈值
              unicodeEscapeSequence: false//unicode转义序列
            }
          })
        ]
      },
    }
  }
}) 
