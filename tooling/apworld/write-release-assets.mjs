/* @layer tooling-scripts @kind logic */
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const sha256Of = (bytes) => createHash('sha256').update(bytes).digest('hex');

const buildOf = ({ bytes, apVersion, file }) => ({
  archipelagoVersion: apVersion,
  file,
  sha256: sha256Of(bytes),
  size: bytes.length,
  bundle: `${file}.sigstore.json`,
});

const indexOf = (input) => {
  const { bytes, moduleName, game, worldVersion, appVersion, versions, assetName } = input;
  return {
    game,
    module: moduleName,
    worldVersion,
    appVersion,
    minimumAp: versions[0],
    maximumAp: versions[versions.length - 1],
    builds: versions.map((apVersion) => buildOf({ bytes, apVersion, file: assetName(apVersion) })),
  };
};

/**
 * The release assets: one apworld per supported Archipelago version, a byte-identical copy of
 * the newest under the plain module name, and one index naming every build with its hash, size
 * and the name its signature bundle will carry. The world is the same for every version, so the
 * zip is built once and written under each name.
 */
const writeReleaseAssets = (input) => {
  const { outDir, bytes, moduleName, versions, assetName } = input;
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const files = [...versions.map(assetName), `${moduleName}.apworld`];
  for (const name of files) writeFileSync(path.join(outDir, name), bytes);
  const index = indexOf(input);
  writeFileSync(path.join(outDir, `${moduleName}.apworld.json`), `${JSON.stringify(index, null, 2)}\n`);
  return { files, index };
};

export { writeReleaseAssets };
