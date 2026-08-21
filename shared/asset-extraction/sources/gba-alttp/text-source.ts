/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../rom/gba-rom';

const TEXT_DATA_BLOCK = 0x08180ce8;
const TEXT_POINTER_TABLE = 0x08180d08;
const TEXT_BASE = 0x08181448;
const TEXT_POINTER_OFFSET = 0x10;
const TEXT_COUNT = 0x1c7;

interface GbaAlttpTextMessage {
  id: number;
  address: number;
  bytes: Buffer;
  plainText: string;
}

const decodeTextByte = (rom: GbaRomReader, address: number): number => {
  const relative = address - TEXT_DATA_BLOCK;
  if (relative < 0) throw new Error(`Text address 0x${address.toString(16)} precedes the data block`);
  const low = relative & 0xff;
  const lane = relative & 0x0f;
  let value = (low - rom.romByte(0x08180cd0 + 15 - lane)) & 0xff;
  value ^= rom.romByte(address);
  if (relative > 0x2a) value = (value - rom.romByte(address - 0x2b)) & 0xff;
  value = (value - low) & 0xff;
  return value ^ rom.romByte(0x08180cd0 + lane);
};

const textAddress = (rom: GbaRomReader, id: number): number => {
  if (!Number.isInteger(id) || id < 0 || id >= TEXT_COUNT) throw new Error(`Invalid ALttP GBA text ID ${id}`);
  const pointer = TEXT_POINTER_TABLE + TEXT_POINTER_OFFSET + id * 4;
  const relative = (
    (decodeTextByte(rom, pointer) << 24)
    | (decodeTextByte(rom, pointer + 1) << 16)
    | (decodeTextByte(rom, pointer + 2) << 8)
    | decodeTextByte(rom, pointer + 3)
  ) >>> 0;
  return TEXT_BASE + 8 + relative;
};

const toPlainText = (bytes: Buffer): string => {
  let result = '';
  for (let index = 0; index < bytes.length; index++) {
    const value = bytes[index];
    if (value === 0x1a) {
      index += 4;
      result += ' ';
    } else if (value === 0x0a) {
      result += '\n';
    } else if (value >= 0x20 && value < 0x7f) {
      result += String.fromCharCode(value);
    }
  }
  return result.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
};

const extractGbaAlttpText = (rom: GbaRomReader): GbaAlttpTextMessage[] => {
  const addresses = Array.from({ length: TEXT_COUNT }, (_, id) => textAddress(rom, id));
  return addresses.map((start, id) => {
    const end = id + 1 < addresses.length ? addresses[id + 1] : 0x08195d80;
    if (end < start || end > 0x08800000) throw new Error(`Invalid text bounds for ID 0x${id.toString(16)}`);
    const bytes = Buffer.from(Array.from({ length: end - start }, (_, offset) => decodeTextByte(rom, start + offset)));
    return { id, address: start, bytes, plainText: toPlainText(bytes) };
  });
};

const GBA_EXCLUSIVE_TEXT_IDS = Array.from({ length: TEXT_COUNT - 0x195 }, (_, index) => 0x195 + index);

export {
  GBA_EXCLUSIVE_TEXT_IDS,
  TEXT_BASE,
  TEXT_COUNT,
  TEXT_DATA_BLOCK,
  TEXT_POINTER_TABLE,
  decodeTextByte,
  extractGbaAlttpText,
};
export type { GbaAlttpTextMessage };
