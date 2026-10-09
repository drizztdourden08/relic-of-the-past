/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { lzDecompressWithLen } from '../asset-builder';
import { kCompSpritePtrs } from '../data/tables';

const buildSpriteGfx = (rom: RomData, A: AssetBuilder): void => {
  const all: Buffer[] = [];
  for (let i = 0; i < 108; i++) {
    if (i < 12) {
      all.push(Buffer.from(rom.getBytes(kCompSpritePtrs[i], 0x600)));
    } else {
      const { compressedLength } = lzDecompressWithLen(rom, kCompSpritePtrs[i]);
      all.push(Buffer.from(rom.getBytes(kCompSpritePtrs[i], compressedLength)));
    }
  }
  A.addPacked('kSprGfx', all);
};

export { buildSpriteGfx };
