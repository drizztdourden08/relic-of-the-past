/* @layer shared-asset-extraction @kind logic */
const GBA_SAVE_SIGNATURE = 'A LINK TO THE PAST & 4 SWORDS,64';
const GBA_SAVE_SLOT_DATA = 0x580;
const GBA_SAVE_SLOT_STRIDE = 0x500;
const GBA_SAVE_SLOT_COUNT = 3;

interface GbaAlttpSaveSlotProgression {
  slot: number;
  type: string;
  initialized: boolean;
  powers: number;
  swordBeam: boolean;
  hurricaneSpin: boolean;
  playerName: string;
  checksumStored: number;
  checksumCalculated: number;
  checksumValid: boolean;
}

const checksum = (data: Uint8Array): number => {
  if (data.length === 0 || (data.length & 1) !== 0) throw new Error('Save checksum data must have a positive even length');
  let sum = 0;
  for (let offset = 0, remaining = data.length; offset < data.length; offset += 2, remaining -= 2) {
    sum = (sum + ((data[offset] | (data[offset + 1] << 8)) ^ remaining)) & 0xffff;
  }
  return sum;
};

const slotChecksum = (type: Uint8Array, data: Uint8Array): number => {
  const combined = (checksum(type) + checksum(data)) & 0xffff;
  return ((combined << 16) | ((~combined + 1) & 0xffff)) >>> 0;
};

const reverseEightByteBlocks = (save: Uint8Array): Buffer => {
  const result = Buffer.from(save);
  for (let offset = 0; offset < result.length; offset += 8) {
    result.subarray(offset, Math.min(offset + 8, result.length)).reverse();
  }
  return result;
};

const normalizeGbaAlttpSave = (save: Uint8Array): Buffer => {
  const direct = Buffer.from(save);
  if (direct.subarray(0, 0x20).toString('ascii') === GBA_SAVE_SIGNATURE) return direct;
  const reversed = reverseEightByteBlocks(save);
  if (reversed.subarray(0, 0x20).toString('ascii') === GBA_SAVE_SIGNATURE) return reversed;
  throw new Error('The save is not an ALttP & Four Swords SRAM image');
};

const decodeGbaAlttpSaveProgression = (save: Uint8Array): GbaAlttpSaveSlotProgression[] => {
  if (save.length < 0x2000) throw new Error(`Expected an 8 KiB GBA save, got ${save.length} bytes`);
  const normalized = normalizeGbaAlttpSave(save);
  return Array.from({ length: GBA_SAVE_SLOT_COUNT }, (_, slot) => {
    const header = 0x70 + slot * 0x20;
    const offset = GBA_SAVE_SLOT_DATA + slot * GBA_SAVE_SLOT_STRIDE;
    const type = normalized.subarray(header + 4, header + 8).toString('ascii');
    const initialized = type === 'S4FT';
    const powers = initialized ? normalized[offset] : 0;
    const checksumStored = ((normalized.readUInt16LE(header) << 16) | normalized.readUInt16LE(header + 2)) >>> 0;
    const checksumCalculated = slotChecksum(
      normalized.subarray(header + 4, header + 8),
      normalized.subarray(offset, offset + 0x40),
    );
    return {
      slot,
      type,
      initialized,
      powers,
      swordBeam: Boolean(powers & 0x01),
      hurricaneSpin: Boolean(powers & 0x02),
      playerName: initialized
        ? normalized.subarray(offset + 8, offset + 14).toString('ascii').replace(/\0+$/, '')
        : '',
      checksumStored,
      checksumCalculated,
      checksumValid: initialized && checksumStored === checksumCalculated,
    };
  });
};

export {
  GBA_SAVE_SIGNATURE,
  GBA_SAVE_SLOT_COUNT,
  GBA_SAVE_SLOT_DATA,
  GBA_SAVE_SLOT_STRIDE,
  decodeGbaAlttpSaveProgression,
  normalizeGbaAlttpSave,
  slotChecksum,
};
export type { GbaAlttpSaveSlotProgression };
