/**
 * Region Detection — builds reverse lookup maps from region definitions.
 * Given a game index (overworld screen or dungeon room), returns the full region data.
 */

import type { RegionDefinition } from '../types';
import { ALL_REGIONS } from './index';

export interface RegionLookup {
  /** Overworld screen index → region */
  byOverworldScreen: Map<number, RegionDefinition>;
  /** Dungeon room index → region (keyed by `palaceIndex:roomIndex`) */
  byDungeonRoom: Map<string, RegionDefinition>;
  /** Cave/interior room index → region */
  byCaveRoom: Map<number, RegionDefinition>;
}

/** Maps dungeon name → palace index byte value used in the ROM */
const DUNGEON_PALACE: Record<string, number> = {
  'Hyrule Castle': 0,
  'Eastern Palace': 2,
  'Desert Palace': 4,
  'Tower of Hera': 6,
  'Palace of Darkness': 8,
  'Swamp Palace': 10,
  'Skull Woods': 12,
  "Thieves' Town": 14,
  'Ice Palace': 16,
  'Misery Mire': 18,
  'Turtle Rock': 20,
  "Ganon's Tower": 22,
  'Castle Tower': 24,
};

function buildRegionLookup(regions: RegionDefinition[] = ALL_REGIONS): RegionLookup {
  const byOverworldScreen = new Map<number, RegionDefinition>();
  const byDungeonRoom = new Map<string, RegionDefinition>();
  const byCaveRoom = new Map<number, RegionDefinition>();

  for (const region of regions) {
    if (region.inGameIndex == null) continue;

    switch (region.type) {
      case 'lightWorld':
      case 'darkWorld':
        byOverworldScreen.set(region.inGameIndex, region);
        break;
      case 'dungeon': {
        const palace = region.dungeon ? (DUNGEON_PALACE[region.dungeon] ?? 0) : 0;
        byDungeonRoom.set(`${palace}:${region.inGameIndex}`, region);
        break;
      }
      case 'cave':
        byCaveRoom.set(region.inGameIndex, region);
        break;
    }
  }

  return { byOverworldScreen, byDungeonRoom, byCaveRoom };
}

let cachedLookup: RegionLookup | null = null;

/**
 * Get or build the region lookup tables (cached on first call).
 */
export function getRegionLookup(): RegionLookup {
  if (!cachedLookup) cachedLookup = buildRegionLookup();
  return cachedLookup;
}

/**
 * Resolve current game state to a RegionDefinition.
 * Returns null if no region is mapped for the current index.
 */
export function resolveCurrentRegion(
  isIndoors: boolean,
  palaceIndex: number,
  roomIndex: number,
  overworldScreenIndex: number,
): RegionDefinition | null {
  const lookup = getRegionLookup();

  if (isIndoors) {
    const dungeonIdx = palaceIndex >> 1;
    if (dungeonIdx <= 12) {
      // Try dungeon lookup first (palace-aware key prevents cross-dungeon collisions)
      const dungeon = lookup.byDungeonRoom.get(`${palaceIndex}:${roomIndex}`);
      if (dungeon) return dungeon;
    }
    // Cave / house (or a cave room that shares an index with a dungeon room)
    return lookup.byCaveRoom.get(roomIndex) ?? null;
  }

  // Overworld
  return lookup.byOverworldScreen.get(overworldScreenIndex) ?? null;
}
