/* @layer shared-game @kind logic */
import type { RoomContext } from './tile-classification.type';

const roomTypeLabel = (room: RoomContext): string => {
  if (!room.indoors) return 'Outdoor';
  return room.palaceIndex !== null ? `Indoor · dungeon ${room.palaceIndex}` : 'Indoor · non-dungeon';
};

export { roomTypeLabel };
