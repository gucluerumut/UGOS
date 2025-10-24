import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { analyzer } from 'vite-bundle-analyzer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'analyze' ? [analyzer()] : [])
  ],
  server: {
    port: 3000,
    open: true,
    host: 'localhost',
    hmr: {
      port: 3001,
      host: 'localhost',
      clientPort: 3001
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Bundle optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          vendor: ['react', 'react-dom'],
          // UI components chunk
          ui: ['lucide-react'],
          // Utils chunk
          utils: ['date-fns']
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Optimize build performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      },
      mangle: {
        safari10: true
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['@vite/client', '@vite/env']
  },
  // Enable esbuild optimizations
  esbuild: {
    target: 'esnext',
    minify: true,
    treeShaking: true
  }
}))