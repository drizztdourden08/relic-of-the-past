/* @layer renderer-lib @kind logic */
/**
 * Renderer assets store: check/load the .dat over FileStore, and extract by running
 * the pure pipeline in a Web Worker (read ROMs + language sets via FileStore → Worker
 * → write the base blob and one sidecar per optional cartridge).
 *
 * The base and each supplement are written to separate files, so rebuilding the base
 * never destroys a supplement. They are only concatenated when loading, because that is
 * the single buffer the core expects. The language sets are read here and compiled in
 * the Worker: the bake step pulls in the whole dialogue compression path, which belongs
 * off the UI thread.
 */
import * as assets from '@shared/storage/assets';
import type { SetBakeInput } from '@shared/game/language';
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import { getPlatform } from '@app/platform/get-platform';
import { runOnWorker } from './extraction-client';
import { listRomsWithStatus } from './roms-store';
import { markAssetsBaked } from '@app/stores/game-assets-store';

interface AssetsResult {
  base: Uint8Array;
  sidecars: { id: AssetSourceId; bytes: Uint8Array }[];
  failures: { id: AssetSourceId; reason: string }[];
}

type ExtractResult = { success: boolean; error?: string; failures?: { id: AssetSourceId; reason: string }[] };

const files = () => getPlatform().files;

const runExtraction = (
  romBytes: Uint8Array,
  supplementRoms: Partial<Record<AssetSourceId, Uint8Array>>,
  languages: SetBakeInput[],
): Promise<AssetsResult> => runOnWorker<AssetsResult>({ op: 'assets', romBytes, supplementRoms, languages });

const checkAssets = (romFile: string): Promise<boolean> => assets.check(files(), romFile);

const loadAssets = async (romFile: string): Promise<ArrayBuffer | null> => {
  const bytes = await assets.load(files(), romFile);
  return bytes ? (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer) : null;
};

const extractAssets = async (romFile: string): Promise<ExtractResult> => {
  try {
    const romBytes = await assets.readRomBytes(files(), romFile);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };

    const languages = await assets.readLanguageSets(files());
    const supplementRoms = await assets.readSupplementRoms(files());
    const result = await runExtraction(romBytes, supplementRoms, languages);

    await assets.writeDat(files(), romFile, result.base);
    for (const sidecar of result.sidecars) {
      await assets.writeSidecar(files(), romFile, sidecar.id, sidecar.bytes);
    }
    // A supplement whose cartridge is gone must not linger as a stale sidecar.
    const produced = new Set(result.sidecars.map((sidecar) => sidecar.id));
    for (const id of Object.keys(supplementRoms) as AssetSourceId[]) {
      if (!produced.has(id)) await assets.removeSidecar(files(), romFile, id);
    }
    // Anything already running booted with the previous blob and is now behind.
    markAssetsBaked();

    return { success: true, ...(result.failures.length > 0 ? { failures: result.failures } : {}) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

// Rebuild every ROM that already has a cached .dat (after a language set changes).
const recompileAll = async (): Promise<void> => {
  for (const rom of await listRomsWithStatus()) {
    if (rom.hasAssets) await extractAssets(rom.romFile);
  }
};

export { checkAssets, loadAssets, extractAssets, recompileAll };
export type { ExtractResult };
