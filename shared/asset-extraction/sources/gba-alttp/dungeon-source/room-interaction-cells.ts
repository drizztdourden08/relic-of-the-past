/* @layer shared-asset-extraction @kind logic */
import type { DungeonInteractionCell, DungeonRoomRecord } from '../../../dungeon/model';
import { ROOM_MAP_SIDE } from './dungeon-source.constants';
import { INTERACTION_ATTRIBUTES } from './dungeon-source.data';

const roomInteractionCells = (room: DungeonRoomRecord): DungeonInteractionCell[] => {
  const result: DungeonInteractionCell[] = [];
  room.layers.forEach((layer, layerIndex) => {
    layer.collision.forEach((attribute, index) => {
      const kind = INTERACTION_ATTRIBUTES[attribute];
      if (kind) result.push({
        roomId: room.id,
        layer: layerIndex + 1,
        x: index % ROOM_MAP_SIDE,
        y: Math.floor(index / ROOM_MAP_SIDE),
        attribute,
        kind,
      });
    });
  });
  return result;
};

export { roomInteractionCells };
