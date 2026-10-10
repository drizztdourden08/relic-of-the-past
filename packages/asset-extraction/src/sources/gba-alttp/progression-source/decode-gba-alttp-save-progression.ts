/* @layer shared-asset-extraction @kind logic */
import type { GbaAlttpSaveSlotProgression } from './progression-source.type';
import {
  GBA_SAVE_BYTES, GBA_SAVE_SLOT_COUNT, GBA_SAVE_SLOT_DATA, GBA_SAVE_SLOT_STRIDE, HURRICANE_SPIN_POWER,
  INITIALIZED_SLOT_TYPE, SLOT_CHECKSUM_DATA_BYTES, SLOT_HEADER_BASE, SLOT_HEADER_STRIDE, SWORD_BEAM_POWER,
} from './progression-source.constants';
import { normalizeGbaAlttpSave } from './normalize-gba-alttp-save';
import { slotChecksum } from './slot-checksum';

const decodeGbaAlttpSaveProgression = (save: Uint8Array): GbaAlttpSaveSlotProgression[] => {
  if (save.length < GBA_SAVE_BYTES) throw new Error(`Expected an 8 KiB GBA save, got ${save.length} bytes`);
  const normalized = normalizeGbaAlttpSave(save);
  return Array.from({ length: GBA_SAVE_SLOT_COUNT }, (_, slot) => {
    const header = SLOT_HEADER_BASE + slot * SLOT_HEADER_STRIDE;
    const offset = GBA_SAVE_SLOT_DATA + slot * GBA_SAVE_SLOT_STRIDE;
    const type = normalized.subarray(header + 4, header + 8).toString('ascii');
    const initialized = type === INITIALIZED_SLOT_TYPE;
    const powers = initialized ? normalized.readUInt8(offset) : 0;
    const checksumStored = ((normalized.readUInt16LE(header) << 16) | normalized.readUInt16LE(header + 2)) >>> 0;
    const checksumCalculated = slotChecksum(
      normalized.subarray(header + 4, header + 8),
      normalized.subarray(offset, offset + SLOT_CHECKSUM_DATA_BYTES),
    );
    return {
      slot,
      type,
      initialized,
      powers,
      swordBeam: Boolean(powers & SWORD_BEAM_POWER),
      hurricaneSpin: Boolean(powers & HURRICANE_SPIN_POWER),
      playerName: initialized
        ? normalized.subarray(offset + 8, offset + 14).toString('ascii').replace(/\0+$/, '')
        : '',
      checksumStored,
      checksumCalculated,
      checksumValid: initialized && checksumStored === checksumCalculated,
    };
  });
};

export { decodeGbaAlttpSaveProgression };
