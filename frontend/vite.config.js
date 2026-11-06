import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Las llamadas a /api se reenvían al backend de Spring Boot.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
