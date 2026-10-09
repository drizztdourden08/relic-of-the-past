/* @layer renderer-lib @kind logic */
import type { MsuLayer } from '@rotp/game-data';
import { decodeAudioFile } from './decode/decode-audio-file';
import type { DecodedAudio } from './decode/decode-audio-file';
import type { LoadBytes, LoadedLayer } from './track-loader.type';
import { TRACK_CACHE_LIMIT } from './track-loader.constants';

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
export type { LoadedLayer, LoadBytes } from './track-loader.type';
