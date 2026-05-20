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

function buildRegionLookup(regions: RegionDefinition[] = ALL_REGIONS): RegionLookup {
  const byOverworldScreen = new Map<number, RegionDefinition>();
  const byDungeonRoom = new Map<string, RegionDefinition>();
  const byCaveRoom = new Map<number, RegionDefinition>();

  for (const region of regions) {
    if (region.inGameIndex == null) continue;

    const indices = Array.isArray(region.inGameIndex)
      ? region.inGameIndex
      : [region.inGameIndex];

    switch (region.type) {
      case 'lightWorld':
      case 'darkWorld':
        for (const idx of indices) byOverworldScreen.set(idx, region);
        break;
      case 'dungeon':
        for (const idx of indices) byDungeonRoom.set(idx.toString(), region);
        break;
      case 'cave':
        for (const idx of indices) byCaveRoom.set(idx, region);
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
      // Dungeon — key is room index (palace context narrows which dungeon)
      return lookup.byDungeonRoom.get(roomIndex.toString()) ?? null;
    }
    // Cave / house
    return lookup.byCaveRoom.get(roomIndex) ?? null;
  }

  // Overworld
  return lookup.byOverworldScreen.get(overworldScreenIndex) ?? null;
}
