/* @layer tooling-scripts @kind logic */
import { readFileSync, rmSync } from 'node:fs';
import { buildApworldSet, writeReleaseFiles } from '@drizztdourden08/archipelia-client-kit/node';
import { AUTHORS, DESCRIPTION, THUMBNAIL } from './apworld.constants.mjs';

/**
 * The one step from a package folder to release assets, done by the Archipelia client kit:
 * zips `sourceDir` reproducibly, adds the exporter files in `data` under the package's data
 * folder, and writes the per-version apworlds, the plain copy of the newest and the index into
 * `outDir`. `versions` are the supported Archipelago versions, oldest first; the first and last
 * become the manifest's minimum and maximum. The kit's release files follow: archipelia.json
 * (this client joins Archipelia lobbies directly), the thumbnail and the description, checked and
 * copied into `outDir` under their standard names. Returns the file names, the index and the newest
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
  const release = await writeReleaseFiles({ dir: outDir, module: input.moduleName, direct: true, thumbnail: THUMBNAIL, description: DESCRIPTION });
  for (const warning of release.warnings) console.warn(`pack-apworld: ${warning}`);
  return {
    files: [...result.files.map((file) => file.file), `${input.moduleName}.apworld`],
    index: result.index,
    bytes: readFileSync(result.latestPath),
  };
};

export { packApworld };
