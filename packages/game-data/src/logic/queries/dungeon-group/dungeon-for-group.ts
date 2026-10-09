/* @layer shared-game @kind logic */
import type { DungeonId } from '../../../data';
import { roomMaps } from './room-maps';

const dungeonForGroup = (group: number): DungeonId | null => {
  const { groupByRoom, dungeonByRoom } = roomMaps();
  for (const [room, id] of dungeonByRoom) {
    if (groupByRoom.get(room) === group) return id;
  }
  return null;
};

export { dungeonForGroup };
