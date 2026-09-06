/* @layer renderer-hud @kind logic */
/**
 * Save-RAM slot → name-record key. The slot/tier rules are the ones the panel
 * has always applied; the result is a record id plus tier, which the name
 * dataset is keyed by. Names stay in the data layer so a language set can retitle them.
 */

/** A key into the name dataset: `<record-id>-<tier>`, tier 1 = the base pickup. */
type ItemNameKey = { recordId: string; tier: number };

/** Base record per save-RAM slot (0-19), in save order. */
const SLOT_RECORD_IDS = [
  'item-012', 'item-013', 'item-011', 'item-041', 'item-042',
  'item-008', 'item-009', 'item-016', 'item-017', 'item-018',
  'item-019', 'item-010', 'item-020', 'item-034', 'item-030',
  'item-023', 'item-022', 'item-025', 'item-026', 'item-027',
];

/**
 * Resolves the record + tier for a slot, or null when the slot is empty.
 * Three slots read their value: one upgrade is a second tier of the same record,
 * two are a rename to a different record, and the rest only recolour their icon,
 * so those keep the base record at tier 1.
 */
const itemNameKeyForSlot = (saveIdx: number, items: number[]): ItemNameKey | null => {
  if (saveIdx < 0 || saveIdx >= SLOT_RECORD_IDS.length) return null;
  const value = items[saveIdx];
  if (!value) return null;
  if (saveIdx === 0 && value >= 4) return { recordId: 'item-012', tier: 2 };
  if (saveIdx === 4 && value >= 2) return { recordId: 'item-014', tier: 1 };
  if (saveIdx === 12 && value >= 2) return { recordId: 'item-021', tier: 1 };
  return { recordId: SLOT_RECORD_IDS[saveIdx], tier: 1 };
};

export { itemNameKeyForSlot };
export type { ItemNameKey };
