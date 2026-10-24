/* @layer tooling-scripts @kind logic */
import { writeReleaseAssets } from './write-release-assets.mjs';
import { zipPackage } from './zip-package.mjs';

/**
 * The one step from a package folder to release assets: zips `sourceDir` reproducibly and writes
 * the per-version apworlds, the plain copy and the index into `outDir`. `versions` are the
 * supported Archipelago versions, oldest first; `assetName` maps one to its file name.
 */
const packApworld = async (input) => {
  const { sourceDir, moduleName } = input;
  const bytes = await zipPackage({ sourceDir, moduleName });
  return { ...writeReleaseAssets({ ...input, bytes }), bytes };
};

export { packApworld };
