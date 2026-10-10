/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';

const copySoundBank = (rom: RomData, ea: number, memory: (number | null)[]): number => {
  let at = ea;
  for (let block = 0; block <= 256; block++) {
    const numBytes = rom.getWord(at);
    const target = rom.getWord(at + 2);
    if (numBytes === 0) return target;
    at += 4;
    for (let i = 0; i < numBytes; i++) {
      memory[target + i] = rom.getByte(at);
      at += 1;
      if ((at & 0xffff) < 0x8000) at += 0x8000;
    }
  }
  return 0;
};

export { copySoundBank };
