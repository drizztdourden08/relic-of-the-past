/* @layer renderer-lib @kind logic */
/**
 * Loads and decodes the audio a single track or claimed sound needs, on demand.
 *
 * Per-id, not per-pack, on purpose: a real pack is well over a gigabyte of raw PCM, and
 * only a few ids sound at a time. Decoded audio is cached so re-entering an area (or firing the
 * same effect again) does not decode twice, with the cache capped so a long session cannot grow
 * without bound. One loader per channel, so a busy effect channel cannot evict the music.
 */
import type { MsuLayer } from '@shared/types/msu-manifest';
import { decodeAudioFile } from './decode/decode-audio-file';
import type { DecodedAudio } from './decode/decode-audio-file';

/** Decoded audio for one layer, in the layer's own file order. */
interface LoadedLayer {
  layerIndex: number;
  files: DecodedAudio[];
  /** Names of the same files, in the same order, for reporting what is sounding. */
  fileNames: string[];
}

type LoadBytes = (fileName: string) => Promise<Uint8Array | null>;

/** How many decoded tracks to keep. Music tracks are large; a handful covers area churn. */
const TRACK_CACHE_LIMIT = 4;

const createTrackLoader = (
  ctx: BaseAudioContext, loadBytes: LoadBytes,
  onError?: (message: string) => void, cacheLimit = TRACK_CACHE_LIMIT,
) => {
  const cache = new Map<number, LoadedLayer[]>();

  const decodeOne = async (fileName: string): Promise<DecodedAudio | null> => {
    try {
      const bytes = await loadBytes(fileName);
      if (!bytes) { onError?.(`${fileName}: not found in the pack`); return null; }
      return await decodeAudioFile(ctx, fileName, bytes);
    } catch (err) {
      onError?.(`${fileName}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  const load = async (key: number, trackLayers: MsuLayer[]): Promise<LoadedLayer[]> => {
    const cached = cache.get(key);
    if (cached) return cached;

    const layers: LoadedLayer[] = [];
    for (const [layerIndex, layer] of trackLayers.entries()) {
      const decoded = await Promise.all(layer.files.map(decodeOne));
      // A layer whose files all failed is dropped instead of left to play silence. Names are
      // filtered alongside so the two arrays stay index-aligned.
      const kept = decoded.map((d, i) => ({ d, name: layer.files[i] })).filter((e): e is { d: DecodedAudio; name: string } => e.d !== null);
      if (kept.length > 0) {
        layers.push({ layerIndex, files: kept.map((e) => e.d), fileNames: kept.map((e) => e.name) });
      }
    }

    cache.set(key, layers);
    if (cache.size > cacheLimit) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    return layers;
  };

  const clear = (): void => { cache.clear(); };

  return { load, clear };
};

export { createTrackLoader };
export type { LoadedLayer, LoadBytes };
