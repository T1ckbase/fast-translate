import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

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
  plugins: [solid()],
});
