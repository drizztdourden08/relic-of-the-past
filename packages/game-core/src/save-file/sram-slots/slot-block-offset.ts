/* @layer bridge-wasm @kind logic */
import { BACKUP_OFFSET, SLOT_BYTES, SLOT_WORDS, SRAM_BYTES, VALID_CHECKSUM } from './sram-slots.constants';

const blockChecksumValid = (bytes: Uint8Array, offset: number): boolean => {
  let sum = 0;
  for (let i = 0; i < SLOT_WORDS; i++) {
    sum += (bytes[offset + i * 2] ?? 0) | ((bytes[offset + i * 2 + 1] ?? 0) << 8);
  }
  return (sum & 0xffff) === VALID_CHECKSUM;
};

const slotBlockOffset = (bytes: Uint8Array, slot: number): number | null => {
  if (bytes.length < SRAM_BYTES) return null;
  const base = slot * SLOT_BYTES;
  if (blockChecksumValid(bytes, base)) return base;
  if (blockChecksumValid(bytes, base + BACKUP_OFFSET)) return base + BACKUP_OFFSET;
  return null;
};

export { slotBlockOffset };
