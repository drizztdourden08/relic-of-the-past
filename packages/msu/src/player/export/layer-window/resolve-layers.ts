/* @layer renderer-lib @kind logic */
import type { MsuTrackDef } from '@rotp/game-data';
import type { ResolvedLayer } from './layer-window.type';

const resolveLayers = (track: MsuTrackDef, files: Map<string, AudioBuffer>): ResolvedLayer[] => {
  const out: ResolvedLayer[] = [];
  for (const [index, layer] of track.layers.entries()) {
    const buffers = layer.files.map((name) => files.get(name)).filter((b): b is AudioBuffer => !!b);
    if (buffers.length > 0) out.push({ layer, index, buffers });
  }
  return out;
};

export { resolveLayers };
