/* @layer shared-game @kind logic */
/**
 * Dungeon group id — what the sim's per-dungeon ledger keys on instead of a raw
 * palace index. Every dungeon stands alone under its own index, except one: the
 * sewers (palace index 0) are reachable ONLY through the castle above them
 * (palace index 1), so a run that leaves through the castle and comes back
 * through it must find the sewers' owed checks under the SAME ledger entry.
 * No other palace shares this property — this is a single named exception,
 * not a general grouping rule.
 */
import { SCREEN_BY_ID } from './index';

/** `palaceIndex` is the raw `cur_palace_index_x2` a screen carries; the game's
 *  own dungeon tables (and this ledger) index by `palaceIndex >> 1`. */
const dungeonGroupOf = (palaceIndex: number): number => {
  const dungeonIndex = palaceIndex >> 1;
  return dungeonIndex === 0 ? 1 : dungeonIndex;
};

/** Room number out of a traversal id (`room:N`, optionally region- and
 *  door-qualified). Overworld ids carry no room and yield null. */
const ROOM_ID = /^room:(\d+)/;

/** Room number -> group, built once. A traversal id names the game's own room
 *  number, never a definition's slug, so the lookup has to go through the room
 *  number the screens carry rather than through the id. */
let groupByRoom: Map<number, number> | null = null;
/** Room number -> the dungeon's own name, for the key bookkeeping that is keyed
 *  by dungeon rather than by group (a group can span two palace indices). */
let nameByRoom: Map<number, string> | null = null;

const buildRoomMaps = (): void => {
  groupByRoom = new Map<number, number>();
  nameByRoom = new Map<number, string>();
  for (const screen of SCREEN_BY_ID.values()) {
    if (screen.type !== 'dungeon' || screen.roomIndex === undefined) continue;
    groupByRoom.set(screen.roomIndex, dungeonGroupOf(screen.dungeon.palaceIndex));
    if (screen.location) nameByRoom.set(screen.roomIndex, screen.location);
  }
};

const roomGroups = (): Map<number, number> => {
  if (!groupByRoom) buildRoomMaps();
  return groupByRoom as Map<number, number>;
};

/** The dungeon's display name for a traversal id, or null when it is not a dungeon. */
const dungeonNameForScreen = (screenId: string): string | null => {
  const m = ROOM_ID.exec(screenId);
  if (!m) return null;
  if (!nameByRoom) buildRoomMaps();
  return (nameByRoom as Map<number, string>).get(Number(m[1])) ?? null;
};

/** The dungeon group a screen belongs to, or null when it isn't a dungeon room. */
const dungeonGroupForScreen = (screenId: string): number | null => {
  const m = ROOM_ID.exec(screenId);
  if (!m) return null;
  return roomGroups().get(Number(m[1])) ?? null;
};

export { dungeonGroupOf, dungeonGroupForScreen, dungeonNameForScreen };
