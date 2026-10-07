/* @layer shared-game @kind logic */
/**
 * Crosswalk between the reference project's location addresses and the
 * native chest table (linear offset 0xe96e, 168 entries, 3 bytes each,
 * same table the S1 census reads).
 *
 * Empirically validated against the live-verified anchors in
 * anchor-checks.data.ts: chest-check addresses fall inside the table span
 * and advance in 3-byte strides congruent to the table base, so
 * tableIndex = (address - 0xe96e) / 3. (The anchors rule out an item-byte
 * +2 offset: consecutive same-room entries sit exactly 3 apart starting at
 * an address ≡ 0xe96e mod 3.)
 *
 * The address alone yields only a GLOBAL table index. A per-room chest
 * ordinal needs the table contents (room ids in table order), so the join
 * against the S1 census is a separate step: joinCrosswalk.
 */
const CHEST_TABLE_LINEAR_BASE = 0xe96e;
const CHEST_TABLE_ENTRY_SIZE = 3;
const CHEST_TABLE_COUNT = 168;
/** Addresses at or above this are the reference project's own expanded-ROM slots. */
const AP_CUSTOM_ADDRESS_FLOOR = 0x180000;

/**
 * Map a location address to its global chest-table index, or null when the
 * address is not a chest-table slot (custom expanded-ROM location, outside
 * the table span, or not stride-aligned).
 */
const chestAddressToTableIndex = (romAddress: number | null): number | null => {
  if (romAddress === null || romAddress >= AP_CUSTOM_ADDRESS_FLOOR) return null;
  const offset = romAddress - CHEST_TABLE_LINEAR_BASE;
  if (offset < 0 || offset % CHEST_TABLE_ENTRY_SIZE !== 0) return null;
  const index = offset / CHEST_TABLE_ENTRY_SIZE;
  return index < CHEST_TABLE_COUNT ? index : null;
};

/**
 * Resolve a global table index to (roomId, chestIndex) using the in-order
 * native table (S1 census provides it at runtime). chestIndex is the
 * entry's ordinal among earlier entries of the same room, matching the
 * save-bit assignment order.
 */
const joinCrosswalk = (
  tableIndex: number,
  chestTable: readonly { roomId: number }[],
): { roomId: number; chestIndex: number } | null => {
  if (!Number.isInteger(tableIndex) || tableIndex < 0 || tableIndex >= chestTable.length) {
    return null;
  }
  const { roomId } = chestTable[tableIndex];
  let chestIndex = 0;
  for (let i = 0; i < tableIndex; i++) {
    if (chestTable[i].roomId === roomId) chestIndex += 1;
  }
  return { roomId, chestIndex };
};

export { AP_CUSTOM_ADDRESS_FLOOR, CHEST_TABLE_COUNT, CHEST_TABLE_ENTRY_SIZE, CHEST_TABLE_LINEAR_BASE, chestAddressToTableIndex, joinCrosswalk };
