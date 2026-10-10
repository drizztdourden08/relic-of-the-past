/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';

const wordAt = (rom: RomData, at: number): number => rom.getByte(at) | (rom.getByte(at + 1) << 8);

const copyDoors = (rom: RomData, start: number, data: number[]): number => {
  let at = start;
  for (;;) {
    if (wordAt(rom, at) === 0xffff) {
      data.push(0xff, 0xff);
      return at + 2;
    }
    data.push(rom.getByte(at), rom.getByte(at + 1));
    at += 2;
  }
};

const copyLayer = (rom: RomData, start: number, data: number[]): { next: number; doorsAt: number | null } => {
  let at = start;
  for (;;) {
    const w = wordAt(rom, at);
    if (w === 0xffff) {
      data.push(0xff, 0xff);
      return { next: at + 2, doorsAt: null };
    }
    if (w === 0xfff0) {
      data.push(0xf0, 0xff);
      const doorsAt = data.length;
      return { next: copyDoors(rom, at + 2, data), doorsAt };
    }
    data.push(rom.getByte(at), rom.getByte(at + 1), rom.getByte(at + 2));
    at += 3;
  }
};

const copyRoomObjects = (rom: RomData, roomAddr: number, data: number[]): number => {
  let at = roomAddr + 2;
  let doorOffset = 0;
  for (let layer = 0; layer < 3; layer++) {
    const { next, doorsAt } = copyLayer(rom, at, data);
    at = next;
    if (layer === 2 && doorsAt !== null) doorOffset = doorsAt;
  }
  return doorOffset;
};

export { copyRoomObjects };
