/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord, NativeDungeonLayer } from '../dungeon/model';

const roomMajorLayerBuffers = (
  rooms: readonly DungeonRoomRecord[], select: (layer: NativeDungeonLayer) => Buffer,
): Buffer[] => {
  const result: Buffer[] = [];
  for (const room of rooms) for (const layer of room.layers) result.push(select(layer));
  return result;
};

export { roomMajorLayerBuffers };
