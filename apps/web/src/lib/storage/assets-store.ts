/* @layer renderer-lib @kind logic */
/**
 * Renderer assets store: check/load the .dat over FileStore, and extract by running
 * the pure pipeline in a Web Worker (read ROM + language sets via FileStore → Worker
 * → write .dat). Mirrors the window.api assets surface for 1:1 call-site swap.
 *
 * The sets are read here and compiled in the Worker: the bake step pulls in the
 * whole dialogue compression path, which belongs off the UI thread.
 */
import * as assets from '@shared/storage/assets';
import type { SetBakeInput } from '@shared/game/language';
import { getPlatform } from '@app/platform/get-platform';
import { runOnWorker } from './extraction-client';
import { listRomsWithStatus } from './roms-store';
import { markAssetsBaked } from '@app/stores/game-assets-store';

const files = () => getPlatform().files;

const runExtraction = (romBytes: Uint8Array, languages: SetBakeInput[]): Promise<Uint8Array> =>
  runOnWorker<Uint8Array>({ op: 'assets', romBytes, languages });

const checkAssets = (romFile: string): Promise<boolean> => assets.check(files(), romFile);

const loadAssets = async (romFile: string): Promise<ArrayBuffer | null> => {
  const bytes = await assets.load(files(), romFile);
  return bytes ? (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer) : null;
};

const extractAssets = async (romFile: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const romBytes = await assets.readRomBytes(files(), romFile);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };
    const languages = await assets.readLanguageSets(files());
    const dat = await runExtraction(romBytes, languages);
    await assets.writeDat(files(), romFile, dat);
    // Anything already running booted with the previous blob and is now behind.
    markAssetsBaked();
    return { success: true };
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
