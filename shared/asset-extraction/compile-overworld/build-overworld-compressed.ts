/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { lzDecompressWithLen } from '../asset-builder';

const buildOverworldCompressed = (rom: RomData, A: AssetBuilder): void => {
  const hi: Buffer[] = [];
  for (let i = 0; i < 160; i++) {
    const addr = rom.get24(0x82F94D + i * 3);
    const { compressedLength } = lzDecompressWithLen(rom, addr);
    hi.push(Buffer.from(rom.getBytes(addr, compressedLength)));
  }
  A.addPacked('kOverworld_Hibytes_Comp', hi);

  const lo: Buffer[] = [];
  for (let i = 0; i < 160; i++) {
    const addr = rom.get24(0x82FB2D + i * 3);
    const { compressedLength } = lzDecompressWithLen(rom, addr);
    lo.push(Buffer.from(rom.getBytes(addr, compressedLength)));
  }
  A.addPacked('kOverworld_Lobytes_Comp', lo);
};

export { buildOverworldCompressed };
