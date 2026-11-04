import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Configuración preparada para desarrollo local y despliegue en GitHub Pages
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE_PATH || './',
    plugins: [
      react(),
      tailwindcss(),
    ],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
