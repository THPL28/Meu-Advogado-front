import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy /api requests to the Spring Boot backend running on port 8080
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          // Forward cookies so HttpOnly JWT cookies work in dev
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.warn('[Proxy] Backend offline – using mock layer. Error:', err.message);
            });
          },
        },
      },
    },
  };
});
