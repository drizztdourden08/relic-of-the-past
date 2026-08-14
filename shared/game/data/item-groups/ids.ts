/* @layer shared-game @kind data */
/**
 * Stable ids for the seven groups, keyed by name so a call site reads
 * `ITEM_GROUP_IDS.Crystals`.
 *
 * These stay in this repository while the group RECORDS live in the private
 * companion repo, because the ids are resolved at compile time: a call site
 * reads a named property off this object and would stop typechecking if the
 * object could be empty. The records the ids point at can be absent; the ids
 * themselves cannot.
 */
import type { ItemGroupId } from '../types/ids';

const ITEM_GROUP_IDS = {
  Swords: 'ig-001',
  Bottles: 'ig-002',
  Crystals: 'ig-003',
  Pendants: 'ig-004',
  Medallions: 'ig-005',
  Bows: 'ig-006',
  Gloves: 'ig-007',
} as const satisfies Record<string, ItemGroupId>;

export { ITEM_GROUP_IDS };
