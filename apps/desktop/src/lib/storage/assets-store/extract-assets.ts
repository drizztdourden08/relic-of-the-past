/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import type { SetBakeInput } from '@shared/game/language';
import { readLanguageSets } from '@shared/storage/assets/read-language-sets';
import type { AssetSourceId } from '@rotp/asset-extraction';
import { markAssetsBaked } from '@app/stores/game-assets-store';
import { runOnWorker } from '../extraction-client';
import { platformFiles } from '../platform-files';
import { errorMessage } from '../error-message';
import type { AssetsResult, ExtractResult } from './assets-store.type';

const runExtraction = (
  romBytes: Uint8Array,
  supplementRoms: Partial<Record<AssetSourceId, Uint8Array>>,
  languages: SetBakeInput[],
): Promise<AssetsResult> => runOnWorker<AssetsResult>({ op: 'assets', romBytes, supplementRoms, languages });

const removeOrphanSidecars = async (
  romFile: string,
  supplementRoms: Partial<Record<AssetSourceId, Uint8Array>>,
  result: AssetsResult,
): Promise<void> => {
  const produced = new Set(result.sidecars.map((sidecar) => sidecar.id));
  for (const id of Object.keys(supplementRoms) as AssetSourceId[]) {
    if (!produced.has(id)) await assets.removeSidecar(platformFiles(), romFile, id);
  }
};

const extractAssets = async (romFile: string): Promise<ExtractResult> => {
  try {
    const romBytes = await assets.readRomBytes(platformFiles(), romFile);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };

    const languages = await readLanguageSets(platformFiles());
    const supplementRoms = await assets.readSupplementRoms(platformFiles());
    const result = await runExtraction(romBytes, supplementRoms, languages);

    await assets.writeDat(platformFiles(), romFile, result.base);
    for (const sidecar of result.sidecars) {
      await assets.writeSidecar(platformFiles(), romFile, sidecar.id, sidecar.bytes);
    }
    await removeOrphanSidecars(romFile, supplementRoms, result);
    markAssetsBaked();

    return { success: true, ...(result.failures.length > 0 ? { failures: result.failures } : {}) };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
};

export { extractAssets };
