import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: process.env.VITE_BASE_PATH || '/',
    server: {
      port: 3000,
      host: '127.0.0.1',
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: { manualChunks: { 'ui-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom', 'framer-motion'] } }
      }
    },
    ssr: {
      noExternal: ['react-router', 'react-router-dom'],
      resolve: { conditions: ['module', 'module-sync', 'node'] }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
