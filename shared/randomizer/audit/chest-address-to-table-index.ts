/* @layer shared-game @kind logic */
import {
  CHEST_TABLE_COUNT, CHEST_TABLE_ENTRY_SIZE, CHEST_TABLE_LINEAR_BASE, REFERENCE_CUSTOM_ADDRESS_FLOOR,
} from './audit.constants';

const chestAddressToTableIndex = (romAddress: number | null): number | null => {
  if (romAddress === null || romAddress >= REFERENCE_CUSTOM_ADDRESS_FLOOR) return null;
  const offset = romAddress - CHEST_TABLE_LINEAR_BASE;
  if (offset < 0 || offset % CHEST_TABLE_ENTRY_SIZE !== 0) return null;
  const index = offset / CHEST_TABLE_ENTRY_SIZE;
  return index < CHEST_TABLE_COUNT ? index : null;
};

export { chestAddressToTableIndex };
