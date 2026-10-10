/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { appendExtraDungeonMapRecords } from '../extensions/second-cartridge-map';

const buildDungeonMap = (rom: RomData, A: AssetBuilder): void => {
  const kSizes = [75, 125, 50, 75, 175, 75, 50, 75, 50, 200, 150, 75, 100, 200];
  const layouts: Buffer[] = [];
  const tiles: Buffer[] = [];
  for (const [i, size] of kSizes.entries()) {
    const addr = 0xa0000 + rom.getWord(0x8AF605 + i * 2);
    const b = rom.getBytes(addr, size);
    const nonzero = size - Array.from(b).filter(x => x === 0xf).length;
    layouts.push(Buffer.from(b));
    const tileAddr = 0xa0000 + rom.getWord(0x8AFBE4 + i * 2);
    tiles.push(Buffer.from(rom.getBytes(tileAddr, nonzero)));
  }
  appendExtraDungeonMapRecords(layouts, tiles);
  A.addPacked('kDungMap_FloorLayout', layouts);
  A.addPacked('kDungMap_Tiles', tiles);
};

export { buildDungeonMap };
