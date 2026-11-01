/* @layer tooling-scripts @kind logic */
import { createServer } from 'vite';
import { abs, ROOT } from './apworld.constants.mjs';

const BARREL = '/packages/randomizer/src/archipelago/index.ts';

const runExporter = async () => {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, watch: null },
    resolve: { alias: { '@app': abs('apps/desktop/src') } },
  });
  try {
    const {
      exportWorld, AP_GAME, AP_WORLD_VERSION, SUPPORTED_AP_VERSIONS,
    } = await server.ssrLoadModule(BARREL);
    return {
      files: exportWorld(),
      game: AP_GAME,
      worldVersion: AP_WORLD_VERSION,
      apVersions: [...SUPPORTED_AP_VERSIONS],
    };
  } finally {
    await server.close();
  }
};

export { runExporter };
