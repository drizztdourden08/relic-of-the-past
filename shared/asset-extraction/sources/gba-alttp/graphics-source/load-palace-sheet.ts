/* @layer shared-asset-extraction @kind logic */
import { decompressGbaLz77 } from '../../../compression/gba-lz77';
import { gbaAddressToOffset } from '../../../rom/gba-rom';
import type { GbaRomReader } from '../../../rom/gba-rom';
import { SHEET_BYTES } from './graphics-source.constants';

const loadPalaceSheet = (rom: GbaRomReader, address: number): Buffer => {
  const data = decompressGbaLz77(rom, gbaAddressToOffset(address)).data;
  if (data.length !== SHEET_BYTES) throw new Error(`Palace sheet at 0x${address.toString(16)} is not 64 tiles`);
  return data;
};

export { loadPalaceSheet };
