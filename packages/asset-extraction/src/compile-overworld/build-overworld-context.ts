/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../checked-read';
import type { RomData } from '../rom/rom-types';
import type { OverworldContext } from './build-overworld-context.type';

const buildOverworldContext = (rom: RomData): OverworldContext => {
  const areaHeadTable: number[] = [];
  for (let i = 0; i < 64; i++) areaHeadTable.push(rom.getByte(0x82A5EC + i));

  const isSmall = new Array<number>(192).fill(0);
  for (let i = 0; i < 192; i++) isSmall[i] = rom.getByte(0x82f88d + i);

  const isAreaHead = (i: number): boolean => {
        return i >= 128 || areaHeadTable[i & 63] === (i & 63);
      };

  const awrite = (arr: number[], area: number, key: number, value: number): void => {
        arr[key] = value;
        if (area < 128 && !isSmall[area]) {
          arr[key + 1] = value;
          arr[key + 8] = value;
          arr[key + 9] = value;
        }
      };

  for (let i = 0; i < 160; i++) {
    if (!isAreaHead(i)) continue;
    if (i < 192) awrite(isSmall, i, i, itemAt(isSmall, i, 'Overworld area size'));
  }

  return { isAreaHead, isSmall, awrite };
};

export { buildOverworldContext };
