/* @layer root-config @kind config */
/**
 * The Hookshop site: a plain Vite + React build of apps/store, served by Firebase
 * Hosting. Same aliases as the app so it reuses the design system, plus the site kit it
 * stands on. In dev, /api is proxied to the store API's functions-framework so the cookie
 * session stays same-origin. It runs beside the Sanctuary, one port up on both.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const SITE_ROOT = __dirname;
const WEB_SRC = resolve(SITE_ROOT, '../web/src');

export default defineConfig({
  root: SITE_ROOT,
  base: '/',
  publicDir: resolve(SITE_ROOT, 'public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(SITE_ROOT, '../../shared'),
      '@app': WEB_SRC,
      '@ds': resolve(WEB_SRC, 'ui/design-system'),
      '@domains': resolve(WEB_SRC, 'ui/domains'),
      '@site-kit': resolve(SITE_ROOT, '../site-kit'),
    },
  },
  server: {
    port: 5181,
    proxy: {
      // The store API's functions-framework running locally (the router strips the /api prefix itself).
      '/api': { target: 'http://localhost:8081', changeOrigin: false },
    },
  },
  build: {
    outDir: resolve(SITE_ROOT, 'dist'),
    emptyOutDir: true,
  },
});
