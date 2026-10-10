/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { lzDecompressWithLen } from '../asset-builder';
import { spriteSheetAddress } from '../data/sprite-sheet-address';

const buildSpriteGfx = (rom: RomData, A: AssetBuilder): void => {
  const all: Buffer[] = [];
  for (let i = 0; i < 108; i++) {
    if (i < 12) {
      all.push(Buffer.from(rom.getBytes(spriteSheetAddress(i), 0x600)));
    } else {
      const { compressedLength } = lzDecompressWithLen(rom, spriteSheetAddress(i));
      all.push(Buffer.from(rom.getBytes(spriteSheetAddress(i), compressedLength)));
    }
  }
  A.addPacked('kSprGfx', all);
};

export { buildSpriteGfx };
