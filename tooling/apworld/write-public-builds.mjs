/* @layer tooling-scripts @kind logic */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { serializeApworldIndex } from '@drizztdourden08/archipelia-client-kit';

const writePublicBuilds = ({ publicDir, moduleName, versions, bytes, index }) => {
  rmSync(publicDir, { recursive: true, force: true });
  for (const apVersion of versions) {
    mkdirSync(path.join(publicDir, apVersion), { recursive: true });
    writeFileSync(path.join(publicDir, apVersion, `${moduleName}.apworld`), bytes);
  }
  writeFileSync(path.join(publicDir, 'builds.json'), serializeApworldIndex(index));
};

export { writePublicBuilds };
