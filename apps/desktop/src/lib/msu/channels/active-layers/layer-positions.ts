/* @layer renderer-lib @kind logic */
import type { ActiveLayer, ChannelResume } from '../channel.type';

const layerPositions = (layers: ActiveLayer[]): ChannelResume['layers'] => {
  const positions: ChannelResume['layers'] = {};
  for (const entry of layers) positions[entry.layerId] = entry.scheduler.position();
  return positions;
};

export { layerPositions };
