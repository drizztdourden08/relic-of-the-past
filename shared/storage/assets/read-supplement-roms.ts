/* @layer shared-storage @kind logic */
import { SUPPLEMENT_IDS } from '@shared/asset-extraction/sources/source-ids';
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@shared/platform';
import { supplementRomFile } from './supplement-rom-file';

const readSupplementRoms = async (files: FileStore): Promise<Partial<Record<AssetSourceId, Uint8Array>>> => {
  const out: Partial<Record<AssetSourceId, Uint8Array>> = {};
  for (const id of SUPPLEMENT_IDS) {
    const file = await supplementRomFile(files, id);
    if (!file) continue;
    const bytes = await files.readBytes(`roms/${file}`);
    if (bytes) out[id] = bytes;
  }
  return out;
};

export { readSupplementRoms };
