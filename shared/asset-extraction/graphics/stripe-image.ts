/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';

const applyStripes = (vram: Uint16Array, rom: RomData, start: number): number => {
  let p = start;
  while (!(rom.getByte(p) & 0x80)) {
    const addr = (rom.getByte(p) << 8) | rom.getByte(p + 1);
    const flags = rom.getByte(p + 2);
    const bytes = (((flags << 8) | rom.getByte(p + 3)) & 0x3fff) + 1;
    const step = flags & 0x80 ? 32 : 1;
    p += 4;
    if (flags & 0x40) {
      const value = rom.getWord(p);
      for (let i = 0; i < (bytes + 1) >> 1; i += 1) vram[(addr + i * step) & 0x7fff] = value;
      p += 2;
    } else {
      for (let i = 0; i < bytes >> 1; i += 1) vram[(addr + i * step) & 0x7fff] = rom.getWord(p + i * 2);
      p += bytes;
    }
  }
  return p + 1;
};

export { applyStripes };
