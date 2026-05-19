/**
 * SNES LoROM address translation.
 *
 * In LoROM mapping (used by Zelda 3):
 * - SNES address has bit 15 set (0x8000) in the low word
 * - Bank byte is bits 23-16 (masked to 7 bits for ROM offset)
 * - Linear ROM offset = (bank & 0x7F) * 0x8000 + (addr & 0x7FFF)
 */

/**
 * Convert a SNES LoROM address to a linear ROM file offset.
 * Asserts that bit 15 is set (required for LoROM mapping).
 */
function snesToLinear(ea: number): number {
  if ((ea & 0x8000) === 0) {
    throw new Error(`Invalid SNES address 0x${ea.toString(16)}: bit 15 not set`);
  }
  return ((ea >>> 16) & 0x7f) * 0x8000 + (ea & 0x7fff);
}

/**
 * Advance a SNES address by 1, crossing bank boundaries.
 * When the low 16 bits overflow past 0xFFFF, advance to next bank at 0x8000.
 */
function advanceAddress(ea: number): number {
  ea += 1;
  if ((ea & 0xffff) === 0) {
    ea += 0x8000;
  }
  return ea;
}

/**
 * Advance a SNES address by 1 with word-granularity bank crossing.
 * When bit 15 clears (address crosses out of ROM window), jump to next bank.
 */
function advanceAddressWord(ea: number): number {
  ea += 2;
  if ((ea & 0x8000) === 0) {
    ea += 0x8000;
  }
  return ea;
}

export { advanceAddress, advanceAddressWord, snesToLinear };
