/* @layer shared-game @kind logic */
import type { RoomContext } from './types';

/**
 * Builds a `RoomContext` from the raw native value: `cur_palace_index_x2` is
 * doubled and uses 0xff to mean "not in a dungeon", so this is the one place
 * that sentinel gets translated into `null`.
 */
const resolveRoomContext = (indoors: boolean, rawPalaceIndexX2: number): RoomContext => ({
  indoors,
  palaceIndex: rawPalaceIndexX2 === 0xff ? null : rawPalaceIndexX2 >> 1,
});

/**
 * Display wording only. Never invents a room kind the game does not have.
 * There is deliberately no cave-vs-house distinction: the game has no such field.
 */
const roomTypeLabel = (room: RoomContext): string => {
  if (!room.indoors) return 'Outdoor';
  return room.palaceIndex !== null ? `Indoor · dungeon ${room.palaceIndex}` : 'Indoor · non-dungeon';
};

export { resolveRoomContext, roomTypeLabel };
