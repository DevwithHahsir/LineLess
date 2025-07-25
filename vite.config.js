import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Optional: for path aliases
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  // 🔥 This is what solves the refresh/navigation issue:
  base: '/',
  // This ensures that the index.html is served for all routes
  // needed for React Router in SPA
  define: {
    'process.env': {},
  },
});
