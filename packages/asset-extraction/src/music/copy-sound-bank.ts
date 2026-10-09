/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';

const copySoundBank = (rom: RomData, ea: number, memory: (number | null)[]): number => {
  let j = 0;
  while (true) {
    const numBytes = rom.getWord(ea);
    const target = rom.getWord(ea + 2);
    if (numBytes === 0) return target;
    ea += 4;
    for (let i = 0; i < numBytes; i++) {
      memory[target + i] = rom.getByte(ea);
      ea += 1;
      if ((ea & 0xffff) < 0x8000) ea += 0x8000;
    }
    j++;
    if (j > 256) break;
  }
  return 0;
};

export { copySoundBank };
