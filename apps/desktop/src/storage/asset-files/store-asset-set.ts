/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { SUPPLEMENT_IDS } from '@rotp/asset-extraction';
import { assets } from '@rotp/roms';
import type { AssetsResult, ExtractResult, SupplementRoms } from './asset-files.type';

const storeAssetSet = async (files: FileStore, romFile: string, supplementRoms: SupplementRoms, result: AssetsResult): Promise<ExtractResult> => {
  await assets.writeDat(files, romFile, result.base);
  for (const sidecar of result.sidecars) await assets.writeSidecar(files, romFile, sidecar.id, sidecar.bytes);
  const produced = new Set(result.sidecars.map((sidecar) => sidecar.id));
  for (const id of SUPPLEMENT_IDS) {
    if (supplementRoms[id] && !produced.has(id)) await assets.removeSidecar(files, romFile, id);
  }
  return { success: true, ...(result.failures.length > 0 ? { failures: result.failures } : {}) };
};

export { storeAssetSet };
