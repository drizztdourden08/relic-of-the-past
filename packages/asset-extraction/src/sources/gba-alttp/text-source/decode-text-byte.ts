/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import { TEXT_DATA_BLOCK, TEXT_KEY_TABLE } from './text-source.constants';

const decodeTextByte = (rom: GbaRomReader, address: number): number => {
  const relative = address - TEXT_DATA_BLOCK;
  if (relative < 0) throw new Error(`Text address 0x${address.toString(16)} precedes the data block`);
  const low = relative & 0xff;
  const lane = relative & 0x0f;
  let value = (low - rom.romByte(TEXT_KEY_TABLE + 15 - lane)) & 0xff;
  value ^= rom.romByte(address);
  if (relative > 0x2a) value = (value - rom.romByte(address - 0x2b)) & 0xff;
  value = (value - low) & 0xff;
  return value ^ rom.romByte(TEXT_KEY_TABLE + lane);
};

export { decodeTextByte };
