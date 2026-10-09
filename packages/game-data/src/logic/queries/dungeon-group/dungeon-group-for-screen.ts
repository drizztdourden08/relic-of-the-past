/* @layer shared-game @kind logic */
import { roomMaps } from './room-maps';
import { traversalRoomOf } from './traversal-room-of';

const dungeonGroupForScreen = (screenId: string): number | null => {
  const room = traversalRoomOf(screenId);
  if (room === null) return null;
  return roomMaps().groupByRoom.get(room) ?? null;
};

export { dungeonGroupForScreen };
