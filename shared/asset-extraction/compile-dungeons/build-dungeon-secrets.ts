/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';

const buildDungeonSecrets = (rom: RomData, A: AssetBuilder): void => {
  const result = new Array(640).fill(0);
  for (let i = 0; i < 320; i++) {
    let ea = 0x810000 | rom.getWord(0x81db69 + i * 2);
    if (rom.getWord(ea) === 0xffff) {
      result[i * 2] = -1;
      result[i * 2 + 1] = -1;
    } else {
      result[i * 2] = result.length & 0xff;
      result[i * 2 + 1] = result.length >> 8;
      while (rom.getWord(ea) !== 0xffff) {
        const pos = rom.getWord(ea);
        result.push(pos & 0xff, pos >> 8, rom.getByte(ea + 2));
        ea += 3;
      }
      result.push(0xff, 0xff);
    }
  }
  const emptyOff = result.length - 2;
  for (let i = 0; i < 320; i++) {
    if (result[i * 2] === -1) {
      result[i * 2] = emptyOff & 0xff;
      result[i * 2 + 1] = emptyOff >> 8;
    }
  }
  A.addUint8('kDungeonSecrets', result);
};

export { buildDungeonSecrets };
