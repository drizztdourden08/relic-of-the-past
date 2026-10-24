/* @layer tooling-scripts @kind logic */
import { readFileSync, rmSync } from 'node:fs';
import { buildApworldSet } from '@drizztdourden08/archipelia-client-kit/node';
import { AUTHORS } from './apworld.constants.mjs';

/**
 * The one step from a package folder to release assets, done by the Archipelia client kit:
 * zips `sourceDir` reproducibly, adds the exporter files in `data` under the package's data
 * folder, and writes the per-version apworlds, the plain copy of the newest and the index into
 * `outDir`. `versions` are the supported Archipelago versions, oldest first; the first and last
 * become the manifest's minimum and maximum. Returns the file names, the index and the newest
 * build's bytes.
 */
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
  return {
    files: [...result.files.map((file) => file.file), `${input.moduleName}.apworld`],
    index: result.index,
    bytes: readFileSync(result.latestPath),
  };
};

export { packApworld };
