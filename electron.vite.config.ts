import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/electron',
      lib: {
        entry: resolve(__dirname, 'apps/desktop/electron/main.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      lib: {
        entry: resolve(__dirname, 'apps/desktop/electron/preload.ts'),
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'apps/desktop/src'),
    publicDir: resolve(__dirname, 'apps/desktop/public'),
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'shared'),
        '@app': resolve(__dirname, 'apps/desktop/src'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: resolve(__dirname, 'apps/desktop/src/index.html'),
      },
    },
  },
});
