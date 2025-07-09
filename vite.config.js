import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilitar sourcemaps para produção
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          motion: ['framer-motion'],
          icons: ['react-icons'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // Configuração simplificada de minificação
    minify: 'esbuild', // Usar esbuild ao invés de terser (mais rápido)
    target: 'esnext',
    cssMinify: true
  },
  // PWA Development server configuration
  server: {
    host: true,
    port: 3000,
    https: false
  },
  // PWA Preview configuration
  preview: {
    port: 4173,
    host: true,
    https: false
  },
  // Optimize dependencies for PWA
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-icons/fi',
      '@supabase/supabase-js'
    ]
  },
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __PWA_MODE__: JSON.stringify(process.env.NODE_ENV === 'production')
  },
  // Configuração para suportar JSX em arquivos .jsx
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  }
});