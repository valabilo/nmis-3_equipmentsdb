import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          tables: ['@tanstack/react-table', 'match-sorter'],
          query: ['@tanstack/react-query', 'zustand'],
          charts: ['recharts'],
          pdf: ['jspdf', 'jspdf-autotable'],
          excel: ['xlsx'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
