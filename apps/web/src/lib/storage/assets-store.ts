/* @layer renderer-lib @kind logic */
/**
 * Renderer assets store: check/load the .dat over FileStore, and extract by running
 * the pure pipeline in a Web Worker (read ROM + language packs via FileStore → Worker
 * → write .dat). Mirrors the window.api assets surface for 1:1 call-site swap.
 */
import * as assets from '@shared/storage/assets';
import type { LanguageInput } from '@shared/storage/assets';
import { getPlatform } from '@app/platform/get-platform';
import ExtractWorker from '../game/extract-assets.worker?worker';

const files = () => getPlatform().files;

const runExtraction = (romBytes: Uint8Array, languages: LanguageInput[]): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const worker = new ExtractWorker();
    worker.onmessage = (e: MessageEvent<{ ok: boolean; dat?: Uint8Array; error?: string }>) => {
      worker.terminate();
      if (e.data.ok && e.data.dat) resolve(e.data.dat);
      else reject(new Error(e.data.error ?? 'Asset extraction failed'));
    };
    worker.onerror = (err) => { worker.terminate(); reject(new Error(err.message)); };
    worker.postMessage({ romBytes, languages });
  });

const checkAssets = (romFile: string): Promise<boolean> => assets.check(files(), romFile);

const loadAssets = async (romFile: string): Promise<ArrayBuffer | null> => {
  const bytes = await assets.load(files(), romFile);
  return bytes ? (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer) : null;
};

const extractAssets = async (romFile: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const romBytes = await assets.readRomBytes(files(), romFile);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };
    const languages = await assets.readLanguageInputs(files());
    const dat = await runExtraction(romBytes, languages);
    await assets.writeDat(files(), romFile, dat);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

export { checkAssets, loadAssets, extractAssets };
