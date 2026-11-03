/* @layer tooling-scripts @kind logic */
import { createSsrServer } from '../lib/create-ssr-server.mjs';
import { ROOT } from './apworld.constants.mjs';

const BARREL = '/packages/randomizer/src/archipelago/index.ts';

const runExporter = async () => {
  const server = await createSsrServer(ROOT);
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
