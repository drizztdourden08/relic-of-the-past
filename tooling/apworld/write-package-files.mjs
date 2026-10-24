/* @layer tooling-scripts @kind logic */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CONTAINER_VERSION, DATA_DIR, MANIFEST_FILE } from './apworld.constants.mjs';

/** The exporter JSON, one file per entry, replacing whatever the last build left. */
const writeData = (files) => {
  rmSync(DATA_DIR, { recursive: true, force: true });
  mkdirSync(DATA_DIR, { recursive: true });
  for (const name of Object.keys(files).sort()) {
    writeFileSync(path.join(DATA_DIR, name), `${JSON.stringify(files[name])}\n`);
  }
};

/**
 * archipelago.json, the manifest Archipelago reads from the zip. The first and last supported
 * versions become its minimum and maximum, the keys Archipelago checks before it loads a world.
 */
const writeManifest = ({ game, worldVersion, apVersions }) => {
  const manifest = {
    game,
    world_version: worldVersion,
    minimum_ap_version: apVersions[0],
    maximum_ap_version: apVersions[apVersions.length - 1],
    authors: ['Relic of the Past'],
    version: CONTAINER_VERSION,
    compatible_version: CONTAINER_VERSION,
  };
  writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
};

export { writeData, writeManifest };
