/* @layer shared-game @kind logic */
/**
 * Dungeon group id — what the sim's per-dungeon ledger keys on instead of a raw
 * palace index. Every dungeon stands alone under its own index, except one: the
 * sewers (palace index 0) are reachable ONLY through the castle above them
 * (palace index 1), so a run that leaves through the castle and comes back
 * through it must find the sewers' owed checks under the SAME ledger entry.
 * No other palace shares this property — this is a single named exception,
 * not a general grouping rule.
 *
 * `screenId` here is the SIMULATOR's traversal id (`room:N`, a native room
 * number), not a dataset screen id — see simulation/traversal-id.ts.
 *
 * The room map resolves to a `DungeonId`. It used to resolve to a LOCATION's
 * display name, which the sim then slugified into its key-bucket identity, so the
 * dungeon a key was credited to was a string parsed out of prose. Verified before
 * the swap: 193 dungeon screens, no room claimed by two dungeons, no room missing
 * from its dungeon's `roomScreenIds`, and group↔dungeon is 1:1 across all 13.
 */
import { all, getDungeon, getScreen } from '../../data';
import type { DungeonId } from '../../data';

/** `palaceIndex` is the raw `cur_palace_index_x2` a screen carries; the game's
 *  own dungeon tables (and this ledger) index by `palaceIndex >> 1`. */
const dungeonGroupOf = (palaceIndex: number): number => {
  const dungeonIndex = palaceIndex >> 1;
  return dungeonIndex === 0 ? 1 : dungeonIndex;
};

/** Room number out of a traversal id (`room:N`, optionally region- and
 *  door-qualified). Overworld ids carry no room and yield null. */
const ROOM_ID = /^room:(\d+)/;

let groupByRoom: Map<number, number> | null = null;
let dungeonByRoom: Map<number, DungeonId> | null = null;

/**
 * Rooms come from each dungeon's own `roomScreenIds`, so a room's dungeon is the
 * dungeon that claims it rather than something inferred from the screen's
 * geography. The group still comes off the screen's palace index, which is what
 * folds the sewers in with the castle.
 */
const buildRoomMaps = (): void => {
  groupByRoom = new Map<number, number>();
  dungeonByRoom = new Map<number, DungeonId>();
  for (const dungeon of all('dungeon')) {
    for (const screenId of dungeon.roomScreenIds) {
      const { roomIndex, palaceIndex } = getScreen(screenId).gameId;
      if (roomIndex === undefined) continue;
      dungeonByRoom.set(roomIndex, dungeon.id);
      if (palaceIndex !== undefined) groupByRoom.set(roomIndex, dungeonGroupOf(palaceIndex));
    }
  }
};

const roomGroups = (): Map<number, number> => {
  if (!groupByRoom) buildRoomMaps();
  return groupByRoom as Map<number, number>;
};

const roomDungeons = (): Map<number, DungeonId> => {
  if (!dungeonByRoom) buildRoomMaps();
  return dungeonByRoom as Map<number, DungeonId>;
};

/** The dungeon a group belongs to, or null when no room maps to it. */
const dungeonForGroup = (group: number): DungeonId | null => {
  for (const [room, id] of roomDungeons()) {
    if (roomGroups().get(room) === group) return id;
  }
  return null;
};

/**
 * What to call a group in the run's log. Resolved from the dungeon record, so no
 * game name is spelled out in code — a group spanning two palace indices takes
 * the name of the dungeon that claims its rooms. Falls back to the bare number.
 */
const dungeonGroupName = (group: number): string => {
  const id = dungeonForGroup(group);
  return id ? getDungeon(id).randomizerName : `group ${group}`;
};

/** The dungeon a traversal id sits in, or null when it is not a dungeon room. */
const dungeonForScreen = (screenId: string): DungeonId | null => {
  const m = ROOM_ID.exec(screenId);
  if (!m) return null;
  return roomDungeons().get(Number(m[1])) ?? null;
};

/** The dungeon group a screen belongs to, or null when it isn't a dungeon room. */
const dungeonGroupForScreen = (screenId: string): number | null => {
  const m = ROOM_ID.exec(screenId);
  if (!m) return null;
  return roomGroups().get(Number(m[1])) ?? null;
};

export { dungeonGroupOf, dungeonGroupForScreen, dungeonForScreen, dungeonForGroup, dungeonGroupName };
