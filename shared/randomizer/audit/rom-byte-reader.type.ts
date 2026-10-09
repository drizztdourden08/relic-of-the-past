/* @layer shared-game @kind types */

interface RomByteReader {
  byteAt: (ea: number) => number;
  wordAt: (ea: number) => number;
  signedAt: (ea: number) => number;
}

export type { RomByteReader };
