/* @layer root-config @kind config */
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const nodeAlias = {
  '@shared': resolve(__dirname, 'shared'),
  '@app': resolve(__dirname, 'apps/web/src'),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: nodeAlias },
    build: {
      outDir: 'dist/electron',
      lib: {
        entry: {
          main: resolve(__dirname, 'apps/desktop/electron/main.ts'),
          'hid-worker': resolve(__dirname, 'apps/desktop/electron/input/hid-worker.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: nodeAlias },
    build: {
      outDir: 'dist/preload',
      lib: {
        entry: resolve(__dirname, 'apps/desktop/electron/preload.ts'),
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'apps/web/src'),
    publicDir: resolve(__dirname, 'apps/web/public'),
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'shared'),
        '@app': resolve(__dirname, 'apps/web/src'),
        '@ds': resolve(__dirname, 'apps/web/src/ui/design-system'),
        '@domains': resolve(__dirname, 'apps/web/src/ui/domains'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: resolve(__dirname, 'apps/web/src/index.html'),
      },
    },
  },
});
