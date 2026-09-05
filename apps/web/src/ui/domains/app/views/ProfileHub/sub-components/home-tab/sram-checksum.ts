/* @layer renderer-components @kind logic */
/** Ports the game's own save-slot checksum (Intro_CheckCksum, core/zelda3/src/select_file.c:15)
 *  so an imported SRAM file can be verified before it's ever loaded into the running core. */

const SLOT_BYTES = 0x500;
const SLOT_WORDS = 0x280;
const BACKUP_OFFSET = 0xf00;
const VALID_CHECKSUM = 0x5a5a;
const SLOT_COUNT = 3;

const slotChecksumValid = (bytes: Uint8Array, offset: number): boolean => {
  let sum = 0;
  for (let i = 0; i < SLOT_WORDS; i++) {
    sum += bytes[offset + i * 2] | (bytes[offset + i * 2 + 1] << 8);
  }
  return (sum & 0xffff) === VALID_CHECKSUM;
};

// A slot counts as valid if either its primary copy or its 0xf00 backup checksums correctly,
// the same fallback the game itself uses (Intro_ValidateSram).
const validSramSlots = (bytes: Uint8Array): number[] => {
  const slots: number[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const base = i * SLOT_BYTES;
    if (slotChecksumValid(bytes, base) || slotChecksumValid(bytes, base + BACKUP_OFFSET)) {
      slots.push(i);
    }
  }
  return slots;
};

export { validSramSlots };
