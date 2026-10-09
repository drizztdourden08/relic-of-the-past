/* @layer root-config @kind config */
/**
 * The Sanctuary site: a plain Vite + React build of apps/sanctuary, served by Firebase
 * Hosting. Same aliases as the app so it reuses the design system, plus the site kit it
 * stands on. In dev, /api is proxied to the functions-framework so the cookie session
 * stays same-origin.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { portFor } from '@rotp/hub-contracts';
import { readPortSlot } from '@rotp/hub-contracts/node';

const SITE_ROOT = import.meta.dirname;
const WEB_SRC = resolve(SITE_ROOT, '../desktop/src');
const PORT_SLOT = readPortSlot(resolve(SITE_ROOT, '../..'));

export default defineConfig({
  root: SITE_ROOT,
  base: '/',
  publicDir: resolve(SITE_ROOT, 'public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@app': WEB_SRC,
    },
  },
  server: {
    port: portFor('site', PORT_SLOT),
    strictPort: true,
    proxy: {
      // The functions-framework running locally (npm run sanctuary:api). The router strips
      // the /api prefix itself.
      '/api': { target: `http://localhost:${portFor('siteApi', PORT_SLOT)}`, changeOrigin: false },
    },
  },
  build: {
    outDir: resolve(SITE_ROOT, 'dist'),
    emptyOutDir: true,
  },
});
