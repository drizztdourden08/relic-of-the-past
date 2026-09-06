/* @layer bridge-wasm @kind logic */
/**
 * Battery-save slot geometry — ports the game's own file layout and checksum
 * (SaveGameFile, core/zelda3/src/messaging.c; Intro_CheckCksum,
 * core/zelda3/src/select_file.c). The 8 KiB battery save holds three
 * 0x500-byte file blocks at 0x000 / 0x500 / 0xA00, each mirrored 0xF00
 * later; a block is valid when its 0x280 little-endian words sum to 0x5A5A.
 */

const SRAM_BYTES = 0x2000;
const SLOT_BYTES = 0x500;
const SLOT_WORDS = 0x280;
const BACKUP_OFFSET = 0xf00;
const SRAM_SLOT_COUNT = 3;
const VALID_CHECKSUM = 0x5a5a;

const blockChecksumValid = (bytes: Uint8Array, offset: number): boolean => {
  let sum = 0;
  for (let i = 0; i < SLOT_WORDS; i++) {
    sum += bytes[offset + i * 2] | (bytes[offset + i * 2 + 1] << 8);
  }
  return (sum & 0xffff) === VALID_CHECKSUM;
};

/**
 * The byte offset of one slot's valid file block — the primary copy when it
 * checksums, else the 0xF00 backup (the game's own fallback), else null for
 * an empty or corrupt slot.
 */
const slotBlockOffset = (bytes: Uint8Array, slot: number): number | null => {
  if (bytes.length < SRAM_BYTES) return null;
  const base = slot * SLOT_BYTES;
  if (blockChecksumValid(bytes, base)) return base;
  if (blockChecksumValid(bytes, base + BACKUP_OFFSET)) return base + BACKUP_OFFSET;
  return null;
};

/** The slot indexes (0-based) whose primary or backup block checksums correctly. */
const validSramSlots = (bytes: Uint8Array): number[] => {
  const slots: number[] = [];
  for (let i = 0; i < SRAM_SLOT_COUNT; i++) {
    if (slotBlockOffset(bytes, i) !== null) slots.push(i);
  }
  return slots;
};

export { SRAM_SLOT_COUNT, slotBlockOffset, validSramSlots };
