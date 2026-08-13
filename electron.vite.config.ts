/* @layer root-config @kind config */
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
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
    // node polyfills (Buffer/crypto/fs/…) so the pure-TS asset-extraction pipeline
    // runs in the renderer/Worker, not just Electron main.
    plugins: [react(), nodePolyfills({ globals: { Buffer: true, process: true } })],
    // The extraction Web Worker is bundled separately and needs the same polyfills,
    // or `Buffer` is undefined in the packaged build — dev leaks a global, prod doesn't.
    worker: {
      plugins: () => [nodePolyfills({ globals: { Buffer: true, process: true } })],
    },
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
        // Two pages, one output dir: the app, and the boot splash that runs in its own
        // window while the app loads. Same dir is what lets splash.html reach
        // ./logos/* exactly like index.html does, in dev and packaged alike.
        input: {
          index: resolve(__dirname, 'apps/web/src/index.html'),
          splash: resolve(__dirname, 'apps/web/src/splash.html'),
        },
      },
    },
  },
});
