import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: '/fast-translate/',
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
    modulePreload: {
      polyfill: false,
    },
  },
  plugins: [preact()],
});
