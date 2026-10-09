/* @layer shared-game @kind logic */
import type { DungeonId } from '../../../data';
import { roomMaps } from './room-maps';
import { traversalRoomOf } from './traversal-room-of';

const dungeonForScreen = (screenId: string): DungeonId | null => {
  const room = traversalRoomOf(screenId);
  if (room === null) return null;
  return roomMaps().dungeonByRoom.get(room) ?? null;
};

export { dungeonForScreen };
