/* @layer renderer-lib @kind logic */
/**
 * Renderer assets store: check/load the .dat over FileStore, and extract by running
 * the pure pipeline in a Web Worker (read ROMs + language packs via FileStore → Worker
 * → write the base blob and one sidecar per optional cartridge).
 *
 * The base and each supplement are written to separate files, so rebuilding the base
 * never destroys a supplement. They are only concatenated when loading, because that is
 * the single buffer the core expects.
 */
import * as assets from '@shared/storage/assets';
import type { LanguageInput } from '@shared/storage/assets';
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import { getPlatform } from '@app/platform/get-platform';
import { runOnWorker } from './extraction-client';
import { listRomsWithStatus } from './roms-store';

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
  languages: LanguageInput[],
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

    const languages = await assets.readLanguageInputs(files());
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

    return { success: true, ...(result.failures.length > 0 ? { failures: result.failures } : {}) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

// Rebuild every ROM that already has a cached .dat (after a language pack changes).
const recompileAll = async (): Promise<void> => {
  for (const rom of await listRomsWithStatus()) {
    if (rom.hasAssets) await extractAssets(rom.romFile);
  }
};

export { checkAssets, loadAssets, extractAssets, recompileAll };
export type { ExtractResult };
