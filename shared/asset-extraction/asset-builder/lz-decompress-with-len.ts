/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { decompress as lzDecompress } from '../compression/lz-decompress';

const lzDecompressWithLen = (rom: RomData, addr: number): { data: Buffer; compressedLength: number } => {
  const [data, compressedLength] = lzDecompress(addr, (a) => rom.getByte(a), false, true);
  return { data, compressedLength };
};

export { lzDecompressWithLen };
