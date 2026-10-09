/* @layer renderer-lib @kind logic */
import type { MsuLayer } from '@rotp/game-data';
import { layerPositions } from './active-layers';
import type { ChannelResume, SoundProgram } from './channel.type';
import type { ActiveProgram } from './stateful-channel.type';

const signature = (layer: MsuLayer): string => JSON.stringify([layer.files, layer.mode]);

const carriedAcross = (
  active: ActiveProgram | null,
  byId: ReadonlyMap<number, SoundProgram>,
  id: number,
): ChannelResume | null => {
  if (!active) return null;
  const from = byId.get(active.id);
  const to = byId.get(id);
  if (!from?.group || from.group !== to?.group) return null;
  const positions = layerPositions(active.layers);
  const outgoingBySignature = new Map(from.layers.map((layer) => [signature(layer), layer.id]));
  const layers: ChannelResume['layers'] = {};
  for (const layer of to.layers) {
    const outgoingId = outgoingBySignature.get(signature(layer));
    if (outgoingId !== undefined && positions[outgoingId]) layers[layer.id] = positions[outgoingId];
  }
  return Object.keys(layers).length > 0 ? { id, layers } : null;
};

export { carriedAcross };
