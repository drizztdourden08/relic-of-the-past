/* @layer tooling-scripts @kind logic */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { serializeApworldIndex } from '@drizztdourden08/archipelia-client-kit';

/**
 * The builds the app fetches, laid out like the wasm under apps/desktop/public: one
 * <publicDir>/<archipelago version>/<module>.apworld per supported version, and builds.json
 * beside them with the same content as the release index.
 */
const writePublicBuilds = ({ publicDir, moduleName, versions, bytes, index }) => {
  rmSync(publicDir, { recursive: true, force: true });
  for (const apVersion of versions) {
    mkdirSync(path.join(publicDir, apVersion), { recursive: true });
    writeFileSync(path.join(publicDir, apVersion, `${moduleName}.apworld`), bytes);
  }
  writeFileSync(path.join(publicDir, 'builds.json'), serializeApworldIndex(index));
};

export { writePublicBuilds };
