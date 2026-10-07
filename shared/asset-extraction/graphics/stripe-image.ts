/* @layer shared-asset-extraction @kind logic */
/**
 * The game's stripe image format (HandleStripes14 in core/zelda3/src/nmi.c): runs of
 * VRAM words, each copied or repeated, across the tilemap or down it, ending at a byte
 * with the top bit set. The title screen and the story intro both upload their
 * pictures this way.
 */
import type { RomData } from '../rom/rom-types';

/**
 * Writes the stripe list at SNES address |start| into |vram| (word-addressed). Returns the
 * address just past its terminator, where a list stored back to back with it begins.
 */
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
