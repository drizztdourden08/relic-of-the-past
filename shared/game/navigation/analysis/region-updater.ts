/**
 * Region Updater — reads existing region files, merges nav data, writes back.
 *
 * Rules:
 * - NEVER touch: id, name, displayName, subtitle, tags, gridX, gridY, etc.
 * - ONLY add/update: the `nav` field
 * - Preserve file formatting and structure
 */

import type { RegionNavData } from '../plan/navigation-data.types';

export interface RegionUpdate {
  regionId: string;
  nav: RegionNavData;
}

/**
 * Merge nav data into existing region definitions.
 * Returns the updated source text for the file.
 *
 * TODO: Implement actual AST-based or regex-based file update (Phase 4).
 * For now, returns the update instructions.
 */
export function updateRegions(updates: RegionUpdate[]): RegionUpdate[] {
  // Phase 4: will parse TS files and inject nav fields
  return updates;
}
