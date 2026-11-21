/* @layer tooling-scripts @kind logic */
import { readFileSync } from 'node:fs';
import { createSsrServer } from '@rotp/ssr-server';
import { EN_RANDOMIZER_MESSAGES, ROOT } from './apworld.constants.mjs';

const BARREL = '/packages/randomizer/src/archipelago/index.ts';

const runExporter = async () => {
  const server = await createSsrServer(ROOT);
  try {
    const {
      exportRotpWorld, setExportOptionMessages, AP_GAME, AP_WORLD_VERSION, SUPPORTED_AP_VERSIONS,
    } = await server.ssrLoadModule(BARREL);
    setExportOptionMessages(JSON.parse(readFileSync(EN_RANDOMIZER_MESSAGES, 'utf8')));
    return {
      files: exportRotpWorld(),
      game: AP_GAME,
      worldVersion: AP_WORLD_VERSION,
      apVersions: [...SUPPORTED_AP_VERSIONS],
    };
  } finally {
    await server.close();
  }
};

export { runExporter };
