import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/noble-dynasty/',
  root: '.',
  build: {
    outDir: 'dist/frontend',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
