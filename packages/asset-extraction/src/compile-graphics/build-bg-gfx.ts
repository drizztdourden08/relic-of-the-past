/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { lzDecompressWithLen } from '../asset-builder';
import { kCompBgPtrs } from '../data/tables';
import { bgSheetAddress } from '../data/bg-sheet-address';

const buildBgGfx = (rom: RomData, A: AssetBuilder): void => {
  const all: Buffer[] = [];
  for (let i = 0; i < kCompBgPtrs.length; i++) {
    const { compressedLength } = lzDecompressWithLen(rom, bgSheetAddress(i));
    all.push(Buffer.from(rom.getBytes(bgSheetAddress(i), compressedLength)));
  }
  A.addPacked('kBgGfx', all);
};

export { buildBgGfx };
