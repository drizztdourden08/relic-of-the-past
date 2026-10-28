/* @layer tooling-scripts @kind logic */
import { readFileSync, rmSync } from 'node:fs';
import { buildApworldSet, writeReleaseFiles } from '@drizztdourden08/archipelia-client-kit/node';
import { AUTHORS, DESCRIPTION, THUMBNAIL } from './apworld.constants.mjs';

const packApworld = async (input) => {
  const { sourceDir, outDir, versions, game, worldVersion, appVersion, data } = input;
  rmSync(outDir, { recursive: true, force: true });
  const result = await buildApworldSet({
    game,
    worldVersion,
    appVersion,
    minimumAp: versions[0],
    maximumAp: versions[versions.length - 1],
    module: input.moduleName,
    authors: AUTHORS,
    worldDir: sourceDir,
    outDir,
    data,
    builds: versions.map((archipelagoVersion) => ({ archipelagoVersion })),
  });
  const release = await writeReleaseFiles({ dir: outDir, module: input.moduleName, direct: true, thumbnail: THUMBNAIL, description: DESCRIPTION });
  for (const warning of release.warnings) console.warn(`pack-apworld: ${warning}`);
  return {
    files: [...result.files.map((file) => file.file), `${input.moduleName}.apworld`],
    index: result.index,
    bytes: readFileSync(result.latestPath),
  };
};

export { packApworld };
