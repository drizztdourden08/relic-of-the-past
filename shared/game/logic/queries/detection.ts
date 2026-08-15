/* @layer shared-game @kind logic */
/**
 * Screen Detection — builds reverse lookup maps from screen records. Given a
 * game index (overworld screen or dungeon room), returns the full screen
 * record. Supports variant resolution: multiple records per roomIndex,
 * differentiated by game state. Moved from data/screens/detection.ts —
 * resolution order unchanged, ScreenDefinition → ScreenRecord.
 */
import { all } from '../../data';
import type { ScreenRecord, VariantCondition } from '../../data';
import { scanForRoom } from './palace-fallback';

interface VariantGameState {
  /** Set of check ids that have been collected */
  completedChecks?: ReadonlySet<string>;
  /** WRAM flag reader: (address, bit) → boolean */
  readFlag?: (address: number, bit: number) => boolean;
  /** Which entrance was used to enter this room */
  entranceId?: number;
  /** Current progress tier (0-based) */
  progressTier?: number;
}

const evaluateCondition = (condition: VariantCondition, state: VariantGameState): boolean => {
  switch (condition.type) {
    case 'always':
      return true;
    case 'check': {
      if (!state.completedChecks) return false;
      const has = state.completedChecks.has(condition.id);
      return condition.collected ? has : !has;
    }
    case 'flag': {
      if (!state.readFlag) return false;
      const flagVal = state.readFlag(condition.address, condition.bit);
      return flagVal === condition.value;
    }
    case 'entrance':
      return state.entranceId === condition.id;
    case 'progress':
      if (state.progressTier == null) return false;
      if (condition.min != null && state.progressTier < condition.min) return false;
      if (condition.max != null && state.progressTier > condition.max) return false;
      return true;
  }
};

const resolveVariant = (candidates: ScreenRecord[], state?: VariantGameState): ScreenRecord => {
  if (candidates.length === 1) return candidates[0];
  if (!state) {
    return candidates.find(c => !c.variant || c.variant.condition.type === 'always') ?? candidates[0];
  }

  for (const c of candidates) {
    if (c.variant && c.variant.condition.type !== 'always') {
      if (evaluateCondition(c.variant.condition, state)) return c;
    }
  }

  return candidates.find(c => !c.variant || c.variant.condition.type === 'always') ?? candidates[0];
};

interface ScreenLookup {
  /** Overworld screen index → screen */
  byOverworldScreen: Map<number, ScreenRecord>;
  /** Dungeon room index → screen (keyed by `palaceIndex:roomIndex`) */
  byDungeonRoom: Map<string, ScreenRecord>;
  /** Cave/interior room index → screen (first match only — lossy for duplicates) */
  byCaveRoom: Map<number, ScreenRecord>;
  /** Entrance ID → screen (disambiguates caves with shared room indices) */
  byEntranceId: Map<number, ScreenRecord>;
  /** Cave room index → all screens sharing that room (for fallback matching) */
  byCaveRoomAll: Map<number, ScreenRecord[]>;
  /** Room index → first screen holding it, palace or not (last-resort room match) */
  byRoomAny: Map<number, ScreenRecord>;
}

const buildScreenLookup = (screens: readonly ScreenRecord[] = all('screen')): ScreenLookup => {
  const byOverworldScreen = new Map<number, ScreenRecord>();
  const byDungeonRoom = new Map<string, ScreenRecord>();
  const byCaveRoom = new Map<number, ScreenRecord>();
  const byEntranceId = new Map<number, ScreenRecord>();
  const byCaveRoomAll = new Map<number, ScreenRecord[]>();
  const byRoomAny = new Map<number, ScreenRecord>();

  for (const screen of screens) {
    const { overworldIndex, roomIndex, palaceIndex, entranceId } = screen.gameId;
    if (roomIndex !== undefined && !byRoomAny.has(roomIndex)) byRoomAny.set(roomIndex, screen);

    if (screen.kind === 'overworld' && overworldIndex !== undefined) {
      byOverworldScreen.set(overworldIndex, screen);
    } else if (screen.kind === 'dungeon' && roomIndex !== undefined && palaceIndex !== undefined) {
      byDungeonRoom.set(`${palaceIndex}:${roomIndex}`, screen);
    } else if (roomIndex !== undefined) {
      byCaveRoom.set(roomIndex, screen);
      let list = byCaveRoomAll.get(roomIndex);
      if (!list) { list = []; byCaveRoomAll.set(roomIndex, list); }
      list.push(screen);
    }

    if (entranceId != null) byEntranceId.set(entranceId, screen);
  }

  return { byOverworldScreen, byDungeonRoom, byCaveRoom, byEntranceId, byCaveRoomAll, byRoomAny };
};

let cachedLookup: ScreenLookup | null = null;

const getScreenLookup = (): ScreenLookup => {
  if (!cachedLookup) cachedLookup = buildScreenLookup();
  return cachedLookup;
};

type ScreenMatchMethod = 'exact' | 'entrance' | 'palace-scan' | 'cave-single' | 'cave-ambiguous' | 'variant' | 'overworld';

interface ScreenMatchResult {
  screen: ScreenRecord;
  method: ScreenMatchMethod;
  /** When method is 'palace-scan', the expected palace from data vs actual runtime value */
  palaceMismatch?: { expected: number; actual: number };
  /** The progress tier that was active during resolution */
  progressTier?: number;
}

const resolveCurrentScreen = (isIndoors: boolean, palaceIndex: number, roomIndex: number, overworldScreenIndex: number, whichEntrance?: number, variantState?: VariantGameState): ScreenRecord | null => {
  return resolveCurrentScreenDetailed(isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState)?.screen ?? null;
};

const resolveCurrentScreenDetailed = (isIndoors: boolean, palaceIndex: number, roomIndex: number, overworldScreenIndex: number, whichEntrance?: number, variantState?: VariantGameState): ScreenMatchResult | null => {
  const lookup = getScreenLookup();

  if (isIndoors) {
    // 1. Try entrance ID first (most precise for caves with shared rooms)
    if (whichEntrance != null && whichEntrance !== 0) {
      const byEntrance = lookup.byEntranceId.get(whichEntrance);
      if (byEntrance) return { screen: byEntrance, method: 'entrance' };
    }

    const dungeonIdx = palaceIndex >> 1;
    if (dungeonIdx <= 12) {
      // 2. Dungeon lookup — exact palace:room key
      const dungeon = lookup.byDungeonRoom.get(`${palaceIndex}:${roomIndex}`);
      if (dungeon) return { screen: dungeon, method: 'exact' };

      // 3. Dungeon fallback — scan all palace variants for this room
      const scanned = scanForRoom(lookup.byDungeonRoom, roomIndex, palaceIndex);
      if (scanned) {
        return {
          screen: scanned.screen,
          method: 'palace-scan',
          palaceMismatch: { expected: scanned.expected, actual: palaceIndex },
        };
      }
    }

    // 4. Cave / house — variant-aware resolution
    const candidates = lookup.byCaveRoomAll.get(roomIndex);
    if (candidates && candidates.length === 1 && !candidates[0].variant) {
      return { screen: candidates[0], method: 'cave-single', progressTier: variantState?.progressTier };
    }
    if (candidates && candidates.length >= 1) {
      const resolved = resolveVariant(candidates, variantState);
      const method = candidates.length === 1 ? 'cave-single'
        : (resolved.variant ? 'variant' : 'cave-ambiguous');
      return { screen: resolved, method, progressTier: variantState?.progressTier };
    }

    // 5. Fallback: palace unknown (0xFF) but room might belong to a dungeon
    if (dungeonIdx > 12) {
      const scanned = scanForRoom(lookup.byDungeonRoom, roomIndex, palaceIndex);
      if (scanned) {
        return {
          screen: scanned.screen,
          method: 'palace-scan',
          palaceMismatch: { expected: scanned.expected, actual: palaceIndex },
        };
      }
    }
    return null;
  }

  // Overworld — variant-aware (e.g., post-Aga DW access from same screen)
  const ow = lookup.byOverworldScreen.get(overworldScreenIndex);
  return ow ? { screen: ow, method: 'overworld' } : null;
};

export { getScreenLookup, resolveCurrentScreen, resolveCurrentScreenDetailed };
export type { VariantGameState, ScreenLookup, ScreenMatchMethod, ScreenMatchResult };
