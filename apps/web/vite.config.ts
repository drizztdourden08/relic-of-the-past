/* @layer root-config @kind config */
/**
 * Standalone web build of the renderer (no Electron) → dist/web. Capacitor wraps
 * this output. Mirrors the `renderer` block of electron.vite.config.ts but with a
 * relative base so asset URLs resolve under the mobile WebView origin.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: './',
  publicDir: resolve(__dirname, 'public'),
  plugins: [react()],
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
