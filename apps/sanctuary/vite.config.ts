/* @layer root-config @kind config */
/**
 * The Sanctuary site: a plain Vite + React build of apps/sanctuary, served by Firebase
 * Hosting. Same aliases as the app so it reuses the design system. In dev, /api is
 * proxied to the functions-framework so the cookie session stays same-origin.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { portFor } from '../../shared/config/ports.constants';
import { readPortSlot } from '../../shared/config/port-slot';

const SITE_ROOT = __dirname;
const WEB_SRC = resolve(SITE_ROOT, '../web/src');
const PORT_SLOT = readPortSlot(resolve(SITE_ROOT, '../..'));

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
