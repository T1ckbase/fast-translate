import { defineConfig } from 'vite';

// No hmr

export default defineConfig({
  base: '/fast-translate/',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      react: 'hono/jsx',
      'react/jsx-runtime': 'hono/jsx/jsx-runtime',
      // https://github.com/vercel/swr/blob/0b3c2c757d9ce4f7e386a925f695adf93cf9065c/src/index/use-swr.ts#L3
      // 'use-sync-external-store/shim/index.js': 'hono/jsx',
    },
    // alias: {
    //   react: 'preact/compat',
    //   'react-dom/test-utils': 'preact/test-utils',
    //   'react-dom': 'preact/compat', // Must be below test-utils
    //   'react/jsx-runtime': 'preact/jsx-runtime',
    // },
  },
  build: {
    rolldownOptions: {
      transform: {
        jsx: {
          importSource: 'hono/jsx/dom',
        },
      },
    },
    sourcemap: true,
    target: 'esnext',
    cssTarget: 'esnext',
  },
});
