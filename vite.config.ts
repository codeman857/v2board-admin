/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { renderConfigJs } from './worker/config.ts'

const root = import.meta.dirname

/**
 * 运行时配置 config.js（window.settings）：
 *   - 开发：/config.js 返回项目根目录的 config.local.js（gitignored），不存在时返回 public/config.example.js
 *   - 打包：生成 dist/config.js。设置了 V2B_* 环境变量（如 Cloudflare Pages）时按变量生成，否则复制示例文件，
 *     部署时直接修改 dist/config.js 即可，无需重新打包。本地配置不会被打进产物。
 *   - Cloudflare Workers 部署时 /config.js 由 worker/index.ts 按 Worker 的变量生成，与这里共用 worker/config.ts。
 */
function runtimeConfig(): Plugin {
  const examplePath = path.join(root, 'public/config.example.js')
  const localPath = path.join(root, 'config.local.js')
  return {
    name: 'v2b-runtime-config',
    configureServer(server) {
      server.middlewares.use('/config.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(fs.readFileSync(fs.existsSync(localPath) ? localPath : examplePath, 'utf8'))
      })
    },
    generateBundle() {
      const env = process.env
      const fromEnv = ['V2B_API_HOST', 'V2B_SECURE_PATH'].some((k) => env[k] !== undefined)
      const source = fromEnv
        ? renderConfigJs(env, '由构建环境变量生成（V2B_*），也可以在部署后直接修改本文件')
        : fs.readFileSync(examplePath, 'utf8')
      this.emitFile({ type: 'asset', fileName: 'config.js', source })
    },
  }
}

export default defineConfig({
  // 相对路径，打包产物可以部署在任意子路径 / 静态托管
  base: './',
  plugins: [react(), runtimeConfig()],
  resolve: {
    alias: { '@': path.resolve(root, 'src') },
  },
  server: {
    port: 5173,
    strictPort: true,
    // 比对报告（html）和拆包源码不属于应用，写入时不应触发页面整页刷新（会打断正在进行的截图）
    watch: { ignored: ['**/tools/visual-diff/out/**', '**/.umi-src/**'] },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // bootstrap 4.6 的 SCSS 使用了旧语法，只屏蔽依赖包里的弃用告警
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
      },
    },
  },
  build: {
    target: 'es2023',
    // 页面按需加载（src/app/router.tsx）后最大的包约 600KB：仪表盘（含 ECharts）、React + antd 公共部分
    chunkSizeWarningLimit: 700,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
