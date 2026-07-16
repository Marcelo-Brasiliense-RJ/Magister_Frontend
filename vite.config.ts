import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Alias '@' -> src para imports limpos.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
});
