/**
 * Interior Flood — floods interior rooms (houses, caves, dungeon rooms).
 * Placeholder: requires ROM room data extraction (Phase 3 — needs user testing).
 */

import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type { RegionNavData } from '../plan/navigation-data.types';

export interface InteriorFloodResult {
  roomId: number;
  nav: RegionNavData;
}

/**
 * Flood an interior room and build its navigation data.
 * TODO: Implement once room tile data extraction is validated (Phase 3).
 */
export function floodInterior(_rom: RomData, _roomId: number): InteriorFloodResult | null {
  // Phase 3: needs user testing to validate room data format
  return null;
}
