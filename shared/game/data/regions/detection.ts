/**
 * Region Detection — builds reverse lookup maps from screen/region definitions.
 * Given a game index (overworld screen or dungeon room), returns the full region data.
 */

import type { RegionDefinition } from '../types';
import { getScreenRoomIndex, getScreenPalaceIndex, isOverworld } from '../types';
import { ALL_REGIONS } from './index';
import { DUNGEON_PALACE_VALUES } from './game-values';

export interface RegionLookup {
  /** Overworld screen index → region */
  byOverworldScreen: Map<number, RegionDefinition>;
  /** Dungeon room index → region (keyed by `palaceIndex:roomIndex`) */
  byDungeonRoom: Map<string, RegionDefinition>;
  /** Cave/interior room index → region (first match only — lossy for duplicates) */
  byCaveRoom: Map<number, RegionDefinition>;
  /** Entrance ID → region (disambiguates caves with shared room indices) */
  byEntranceId: Map<number, RegionDefinition>;
  /** Cave room index → all regions sharing that room (for fallback matching) */
  byCaveRoomAll: Map<number, RegionDefinition[]>;
}

/**
 * Get the palace index values for a dungeon region.
 * Uses the region's explicit palaceIndex/gamePalace field first, then derives from dungeon name.
 */
function getPalaceIndicesForRegion(region: RegionDefinition): number[] {
  const explicit = getScreenPalaceIndex(region);
  if (explicit != null) return [explicit];
  if (region.dungeon) {
    return DUNGEON_PALACE_VALUES[region.dungeon] ?? [];
  }
  return [];
}

function buildRegionLookup(regions: RegionDefinition[] = ALL_REGIONS): RegionLookup {
  const byOverworldScreen = new Map<number, RegionDefinition>();
  const byDungeonRoom = new Map<string, RegionDefinition>();
  const byCaveRoom = new Map<number, RegionDefinition>();
  const byEntranceId = new Map<number, RegionDefinition>();
  const byCaveRoomAll = new Map<number, RegionDefinition[]>();

  for (const region of regions) {
    const idx = getScreenRoomIndex(region);
    if (idx == null) continue;

    if (isOverworld(region)) {
      byOverworldScreen.set(idx, region);
    } else if (region.type === 'dungeon') {
      const palaces = getPalaceIndicesForRegion(region);
      for (const palace of palaces) {
        byDungeonRoom.set(`${palace}:${idx}`, region);
      }
    } else {
      // interior / cave — anything else that's indoor
      byCaveRoom.set(idx, region);
      let list = byCaveRoomAll.get(idx);
      if (!list) { list = []; byCaveRoomAll.set(idx, list); }
      list.push(region);
    }

    // Entrance ID lookup (works for any indoor type)
    if (region.entranceId != null) {
      byEntranceId.set(region.entranceId, region);
    }
  }

  return { byOverworldScreen, byDungeonRoom, byCaveRoom, byEntranceId, byCaveRoomAll };
}

let cachedLookup: RegionLookup | null = null;

/**
 * Get or build the region lookup tables (cached on first call).
 */
export function getRegionLookup(): RegionLookup {
  if (!cachedLookup) cachedLookup = buildRegionLookup();
  return cachedLookup;
}

export type RegionMatchMethod = 'exact' | 'entrance' | 'palace-scan' | 'cave-single' | 'cave-ambiguous' | 'overworld';

export interface RegionMatchResult {
  region: RegionDefinition;
  method: RegionMatchMethod;
  /** When method is 'palace-scan', the expected palace from data vs actual runtime value */
  palaceMismatch?: { expected: number; actual: number };
}

/**
 * Resolve current game state to a RegionDefinition with match metadata.
 * Returns null if no region is mapped for the current index.
 * @param whichEntrance — the entrance ID from RAM $010E (optional, improves cave detection)
 */
export function resolveCurrentRegion(
  isIndoors: boolean,
  palaceIndex: number,
  roomIndex: number,
  overworldScreenIndex: number,
  whichEntrance?: number,
): RegionDefinition | null {
  return resolveCurrentRegionDetailed(isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance)?.region ?? null;
}

/**
 * Detailed region resolution — returns match metadata alongside the region.
 * Use this when you need to know HOW the match was found (for warnings/corrections).
 */
export function resolveCurrentRegionDetailed(
  isIndoors: boolean,
  palaceIndex: number,
  roomIndex: number,
  overworldScreenIndex: number,
  whichEntrance?: number,
): RegionMatchResult | null {
  const lookup = getRegionLookup();

  if (isIndoors) {
    // 1. Try entrance ID first (most precise for caves with shared rooms)
    if (whichEntrance != null && whichEntrance !== 0) {
      const byEntrance = lookup.byEntranceId.get(whichEntrance);
      if (byEntrance) return { region: byEntrance, method: 'entrance' };
    }

    const dungeonIdx = palaceIndex >> 1;
    if (dungeonIdx <= 12) {
      // 2. Dungeon lookup — exact palace:room key
      const dungeon = lookup.byDungeonRoom.get(`${palaceIndex}:${roomIndex}`);
      if (dungeon) return { region: dungeon, method: 'exact' };

      // 3. Dungeon fallback — scan all palace variants for this room
      for (const [key, region] of lookup.byDungeonRoom) {
        if (key.endsWith(`:${roomIndex}`)) {
          const storedPalace = parseInt(key.split(':')[0], 10);
          return {
            region,
            method: 'palace-scan',
            palaceMismatch: { expected: storedPalace, actual: palaceIndex },
          };
        }
      }
    }

    // 4. Cave / house — check if there are multiple candidates
    const candidates = lookup.byCaveRoomAll.get(roomIndex);
    if (candidates && candidates.length === 1) {
      return { region: candidates[0], method: 'cave-single' };
    }
    if (candidates && candidates.length > 1) {
      return { region: candidates[0], method: 'cave-ambiguous' };
    }

    // 5. Fallback: palace unknown (0xFF) but room might belong to a dungeon
    if (dungeonIdx > 12) {
      for (const [key, region] of lookup.byDungeonRoom) {
        if (key.endsWith(`:${roomIndex}`)) {
          const storedPalace = parseInt(key.split(':')[0], 10);
          return {
            region,
            method: 'palace-scan',
            palaceMismatch: { expected: storedPalace, actual: palaceIndex },
          };
        }
      }
    }
    return null;
  }

  // Overworld
  const ow = lookup.byOverworldScreen.get(overworldScreenIndex);
  return ow ? { region: ow, method: 'overworld' } : null;
}
