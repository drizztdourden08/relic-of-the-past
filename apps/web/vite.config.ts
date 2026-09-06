/* @layer root-config @kind config */
/**
 * Standalone web build of the renderer (no Electron) → dist/web. Capacitor wraps
 * this output. Mirrors the `renderer` block of electron.vite.config.ts but with a
 * relative base so asset URLs resolve under the mobile WebView origin.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';
import { createRequire } from 'node:module';

// Surface the bundled Capacitor runtime version to the renderer (About page debug
// info). Resolved at build time; absent on other host builds (guard with typeof).
const capacitorVersion = (() => {
  try {
    return createRequire(import.meta.url)('@capacitor/core/package.json').version as string;
  } catch {
    return '';
  }
})();

export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: './',
  define: { __CAP_VERSION__: JSON.stringify(capacitorVersion) },
  publicDir: resolve(__dirname, 'public'),
  plugins: [react(), nodePolyfills({ globals: { Buffer: true, process: true } })],
  // The extraction Web Worker is bundled separately and needs the same polyfills,
  // or `Buffer` is undefined in the packaged build, since dev leaks a global and prod doesn't.
  worker: {
    plugins: () => [nodePolyfills({ globals: { Buffer: true, process: true } })],
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../../shared'),
      '@app': resolve(__dirname, 'src'),
      '@ds': resolve(__dirname, 'src/ui/design-system'),
      '@domains': resolve(__dirname, 'src/ui/domains'),
    },
  },
  build: {
    outDir: resolve(__dirname, '../../dist/web'),
    emptyOutDir: true,
    rollupOptions: { input: resolve(__dirname, 'src/index.html') },
  },
});
