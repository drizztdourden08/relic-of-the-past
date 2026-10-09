/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import { decodeTextByte } from './decode-text-byte';
import {
  TEXT_BASE, TEXT_BASE_HEADER_BYTES, TEXT_COUNT, TEXT_POINTER_OFFSET, TEXT_POINTER_TABLE,
} from './text-source.constants';

const textAddress = (rom: GbaRomReader, id: number): number => {
  if (!Number.isInteger(id) || id < 0 || id >= TEXT_COUNT) throw new Error(`Invalid ALttP GBA text ID ${id}`);
  const pointer = TEXT_POINTER_TABLE + TEXT_POINTER_OFFSET + id * 4;
  const relative = (
    (decodeTextByte(rom, pointer) << 24)
    | (decodeTextByte(rom, pointer + 1) << 16)
    | (decodeTextByte(rom, pointer + 2) << 8)
    | decodeTextByte(rom, pointer + 3)
  ) >>> 0;
  return TEXT_BASE + TEXT_BASE_HEADER_BYTES + relative;
};

export { textAddress };
