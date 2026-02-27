import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteTsConfigPaths(),
  ],
  server: {
    port: 3000,
    host: true,          // expose on LAN (0.0.0.0)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/ScrollToPlugin'],
          router: ['@tanstack/react-router'],
        },
      },
    },
  },
});
