/**
 * Extracts chest data and pit-hurt-player room sets from ROM.
 */
import type { RomData } from '../rom/rom-types';

function getChestInfo(rom: RomData): Map<number, [number, boolean][]> {
  const all = new Map<number, [number, boolean][]>();
  const ea = 0x81e96e;
  for (let i = 0; i < 168; i++) {
    const room = rom.getWord(ea + i * 3);
    const data = rom.getByte(ea + i * 3 + 2);
    const key = room & 0x7fff;
    if (!all.has(key)) all.set(key, []);
    all.get(key)!.push([data, (room & 0x8000) !== 0]);
  }
  return all;
}

function pitsHurtPlayer(rom: RomData): Set<number> {
  const s = new Set<number>();
  for (let i = 0; i < 57; i++) {
    s.add(rom.getWord(0x80990c + i * 2));
  }
  return s;
}

export { getChestInfo, pitsHurtPlayer };
