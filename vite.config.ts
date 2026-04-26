import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Landing-Cabs/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  // Strip every `console.*` call and `debugger` statement from the
  // production bundle, including third-party warnings emitted by Radix,
  // Framer Motion and react-turnstile. Guarantees zero log output in
  // DevTools on www.joincabs.com.
  define: {
    'console.log': '(()=>{})',
    'console.warn': '(()=>{})',
    'console.error': '(()=>{})',
    'console.info': '(()=>{})',
    'console.debug': '(()=>{})',
    'console.trace': '(()=>{})',
    'console.table': '(()=>{})',
    'console.dir': '(()=>{})',
    'console.group': '(()=>{})',
    'console.groupCollapsed': '(()=>{})',
    'console.groupEnd': '(()=>{})',
    'console.time': '(()=>{})',
    'console.timeEnd': '(()=>{})',
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion')) return 'framer'
          if (id.includes('@radix-ui/')) return 'radix'
          return undefined
        },
      },
    },
  },
})
