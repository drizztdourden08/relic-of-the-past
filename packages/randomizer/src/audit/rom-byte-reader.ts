/* @layer shared-game @kind logic */
import { snesToLinear } from '@rotp/asset-extraction';
import { stripCopierHeader } from './strip-copier-header';
import type { RomByteReader } from './rom-byte-reader.type';

const romByteReader = (romBytes: Uint8Array): RomByteReader => {
  const bytes = stripCopierHeader(romBytes);
  const byteAt = (ea: number): number => bytes[snesToLinear(ea)] ?? 0;
  const wordAt = (ea: number): number => byteAt(ea) | (byteAt(ea + 1) << 8);
  const signedAt = (ea: number): number => {
    const value = byteAt(ea);
    return value & 0x80 ? value - 0x100 : value;
  };
  return { byteAt, wordAt, signedAt };
};

export { romByteReader };
