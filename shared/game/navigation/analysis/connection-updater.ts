/**
 * Connection Updater — reads existing connection files, merges nav data, writes back.
 *
 * Rules:
 * - NEVER touch: from, to, entrance, tags
 * - ONLY add/update: the `nav` field
 * - Flag invalid connections (0 overlap) with nav.invalid = true
 * - Append new discoveries with tag 'auto:discovered'
 */

import type { ConnectionNavData } from '../plan/navigation-data.types';

export interface ConnectionUpdate {
  /** Match key: from + to + entrance */
  from: string;
  to: string;
  entrance: string;
  nav: ConnectionNavData;
  /** True if this is a new discovery not in existing data */
  isNew: boolean;
}

/**
 * Merge nav data into existing connection definitions.
 *
 * TODO: Implement actual file update logic (Phase 4).
 * For now, returns the update instructions.
 */
export function updateConnections(updates: ConnectionUpdate[]): ConnectionUpdate[] {
  // Phase 4: will parse TS files and inject nav fields
  return updates;
}
