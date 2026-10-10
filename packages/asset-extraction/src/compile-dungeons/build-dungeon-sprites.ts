/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';

const buildDungeonSprites = (rom: RomData, A: AssetBuilder): void => {
  const offsets = new Array<number>(320).fill(0);
  const data: number[] = [0, 0xff];
  for (let i = 0; i < 320; i++) {
    let ea = 0x890000 + rom.getWord(0x89d62e + i * 2);
    const sortMode = rom.getByte(ea);
    ea++;
    let count = 0;
    let check = ea;
    while (rom.getByte(check) !== 0xff) { count++; check += 3; }
    if (count === 0 && sortMode === 0) continue;
    offsets[i] = data.length;
    data.push(sortMode);
    ea = 0x890000 + rom.getWord(0x89d62e + i * 2) + 1;
    while (rom.getByte(ea) !== 0xff) {
      data.push(rom.getByte(ea), rom.getByte(ea + 1), rom.getByte(ea + 2));
      ea += 3;
    }
    data.push(0xff);
  }
  A.addUint8('kDungeonSprites', data);
  A.addUint16('kDungeonSpriteOffs', offsets);
};

export { buildDungeonSprites };
