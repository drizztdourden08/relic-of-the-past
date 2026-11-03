/* @layer tooling-scripts @kind logic */
import path from 'node:path';
import { createServer } from 'vite';

const createSsrServer = (root) => createServer({
  configFile: false,
  root,
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, watch: null },
  resolve: { alias: { '@app': path.join(root, 'apps/desktop/src') } },
});

export { createSsrServer };
