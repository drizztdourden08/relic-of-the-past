/* @layer shared-game @kind data */
/**
 * Screen Detection — builds reverse lookup maps from screen/screen definitions.
 * Given a game index (overworld screen or dungeon room), returns the full screen data.
 * Supports variant resolution: multiple definitions per roomIndex, differentiated by game state.
 */

import type { ScreenDefinition, VariantCondition } from '../../types';
import { ALL_SCREENS } from './index';

// ─── Variant Resolution ──────────────────────────────────────────────────────

/**
 * Game state snapshot used to evaluate variant conditions.
 * Passed into the resolver to select the correct variant.
 */
interface VariantGameState {
  /** Set of check names that have been collected */
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
    case 'check':
      if (!state.completedChecks) return false;
      const has = state.completedChecks.has(condition.name);
      return condition.collected ? has : !has;
    case 'flag':
      if (!state.readFlag) return false;
      const flagVal = state.readFlag(condition.address, condition.bit);
      return flagVal === condition.value;
    case 'entrance':
      return state.entranceId === condition.id;
    case 'progress':
      if (state.progressTier == null) return false;
      if (condition.min != null && state.progressTier < condition.min) return false;
      if (condition.max != null && state.progressTier > condition.max) return false;
      return true;
  }
};

const resolveVariant = (candidates: ScreenDefinition[], state?: VariantGameState): ScreenDefinition => {
  if (candidates.length === 1) return candidates[0];
  if (!state) {
    // No game state available — return the default (no variant or 'always')
    return candidates.find(c => !c.variant || c.variant.condition.type === 'always') ?? candidates[0];
  }

  // Evaluate conditional variants first (non-always)
  for (const c of candidates) {
    if (c.variant && c.variant.condition.type !== 'always') {
      if (evaluateCondition(c.variant.condition, state)) return c;
    }
  }

  // Fall back to default (no variant field or 'always')
  return candidates.find(c => !c.variant || c.variant.condition.type === 'always') ?? candidates[0];
};

// ─── Lookup Tables ───────────────────────────────────────────────────────────

interface ScreenLookup {
  /** Overworld screen index → screen */
  byOverworldScreen: Map<number, ScreenDefinition>;
  /** Dungeon room index → screen (keyed by `palaceIndex:roomIndex`) */
  byDungeonRoom: Map<string, ScreenDefinition>;
  /** Cave/interior room index → screen (first match only — lossy for duplicates) */
  byCaveRoom: Map<number, ScreenDefinition>;
  /** Entrance ID → screen (disambiguates caves with shared room indices) */
  byEntranceId: Map<number, ScreenDefinition>;
  /** Cave room index → all screens sharing that room (for fallback matching) */
  byCaveRoomAll: Map<number, ScreenDefinition[]>;
}

const getPalaceIndicesForScreen = (screen: ScreenDefinition): number[] => {
  if (screen.type === 'dungeon') {
    return [screen.dungeon.palaceIndex];
  }
  return [];
};

const buildScreenLookup = (regions: ScreenDefinition[] = ALL_SCREENS): ScreenLookup => {
  const byOverworldScreen = new Map<number, ScreenDefinition>();
  const byDungeonRoom = new Map<string, ScreenDefinition>();
  const byCaveRoom = new Map<number, ScreenDefinition>();
  const byEntranceId = new Map<number, ScreenDefinition>();
  const byCaveRoomAll = new Map<number, ScreenDefinition[]>();

  for (const screen of regions) {
    const idx = screen.roomIndex;
    if (idx == null) continue;

    if (screen.type === 'overworld') {
      byOverworldScreen.set(idx, screen);
    } else if (screen.type === 'dungeon') {
      const palaces = getPalaceIndicesForScreen(screen);
      for (const palace of palaces) {
        byDungeonRoom.set(`${palace}:${idx}`, screen);
      }
    } else {
      // interior / cave — anything else that's indoor
      byCaveRoom.set(idx, screen);
      let list = byCaveRoomAll.get(idx);
      if (!list) { list = []; byCaveRoomAll.set(idx, list); }
      list.push(screen);
    }

    // Entrance ID lookup (works for any indoor type)
    if (screen.entranceId != null) {
      byEntranceId.set(screen.entranceId, screen);
    }
  }

  return { byOverworldScreen, byDungeonRoom, byCaveRoom, byEntranceId, byCaveRoomAll };
};

let cachedLookup: ScreenLookup | null = null;

const getScreenLookup = (): ScreenLookup => {
  if (!cachedLookup) cachedLookup = buildScreenLookup();
  return cachedLookup;
};

type ScreenMatchMethod = 'exact' | 'entrance' | 'palace-scan' | 'cave-single' | 'cave-ambiguous' | 'variant' | 'overworld';

interface ScreenMatchResult {
  screen: ScreenDefinition;
  method: ScreenMatchMethod;
  /** When method is 'palace-scan', the expected palace from data vs actual runtime value */
  palaceMismatch?: { expected: number; actual: number };
  /** The progress tier that was active during resolution */
  progressTier?: number;
}

const resolveCurrentScreen = (isIndoors: boolean, palaceIndex: number, roomIndex: number, overworldScreenIndex: number, whichEntrance?: number, variantState?: VariantGameState): ScreenDefinition | null => {
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
      for (const [key, screen] of lookup.byDungeonRoom) {
        if (key.endsWith(`:${roomIndex}`)) {
          const storedPalace = parseInt(key.split(':')[0], 10);
          return {
            screen,
            method: 'palace-scan',
            palaceMismatch: { expected: storedPalace, actual: palaceIndex },
          };
        }
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
      for (const [key, screen] of lookup.byDungeonRoom) {
        if (key.endsWith(`:${roomIndex}`)) {
          const storedPalace = parseInt(key.split(':')[0], 10);
          return {
            screen,
            method: 'palace-scan',
            palaceMismatch: { expected: storedPalace, actual: palaceIndex },
          };
        }
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
