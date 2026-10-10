/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';

const readDungeonChests = (rom: RomData): number[] => {
  const chestTable = 0x81e96e;
  const chestsByRoom = new Map<number, { item: number; big: boolean }[]>();
  for (let i = 0; i < 168; i++) {
    const roomWord = rom.getWord(chestTable + i * 3);
    const item = rom.getByte(chestTable + i * 3 + 2);
    const room = roomWord & 0x7fff;
    const roomChests = chestsByRoom.get(room) ?? [];
    chestsByRoom.set(room, roomChests);
    roomChests.push({ item, big: (roomWord & 0x8000) !== 0 });
  }
  const chests: number[] = [];
  for (let i = 0; i < 320; i++) {
    for (const c of chestsByRoom.get(i) ?? []) {
      chests.push(i & 0xff, (i >> 8) | (c.big ? 0x80 : 0), c.item);
    }
  }
  return chests;
};

export { readDungeonChests };
