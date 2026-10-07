/* @layer shared-asset-extraction @kind logic */
import type { BinaryReader } from '../rom/binary-reader';

interface GbaLz77Result {
  data: Buffer;
  compressedSize: number;
}

const decompressGbaLz77 = (rom: BinaryReader, offset: number): GbaLz77Result => {
  if (rom.byte(offset) !== 0x10) throw new Error(`Expected GBA LZ77 stream at 0x${offset.toString(16)}`);
  const outputSize = rom.uint24(offset + 1);
  const output = Buffer.alloc(outputSize);
  let source = offset + 4;
  let destination = 0;

  while (destination < outputSize) {
    const flags = rom.byte(source++);
    for (let bit = 7; bit >= 0 && destination < outputSize; bit--) {
      if ((flags & (1 << bit)) === 0) {
        output[destination++] = rom.byte(source++);
        continue;
      }
      const first = rom.byte(source++);
      const second = rom.byte(source++);
      const length = (first >>> 4) + 3;
      const displacement = ((first & 0x0f) << 8 | second) + 1;
      if (displacement > destination) throw new Error('Invalid GBA LZ77 back-reference');
      for (let i = 0; i < length && destination < outputSize; i++) {
        output[destination] = output[destination - displacement];
        destination++;
      }
    }
  }
  return { data: output, compressedSize: source - offset };
};

export { decompressGbaLz77 };
export type { GbaLz77Result };
