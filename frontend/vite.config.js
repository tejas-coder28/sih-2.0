import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetBackend = env.BACKEND_URL || env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/health': {
          target: targetBackend,
          changeOrigin: true,
        },
        '/api': {
          target: targetBackend,
          changeOrigin: true,
        },
        '/uploads': {
          target: targetBackend,
          changeOrigin: true,
        }
      }
    }
  };
});
