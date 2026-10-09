/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { bufToArr } from '../asset-builder';

const buildDungeonAttrs = (rom: RomData, A: AssetBuilder): void => {
  A.addUint16('kDungAttrsForTile_Offs', rom.getWords(0x8e9000, 21));
  A.addUint8('kDungAttrsForTile', bufToArr(rom.getBytes(0x8e902a, 1024)));
  A.addUint16('kMovableBlockDataInit', rom.getWords(0x84f1de, 198));
  A.addUint16('kTorchDataInit', rom.getWords(0x84F36A, 144));
  A.addUint16('kTorchDataJunk', rom.getWords(0x84F48a, 48));
};

export { buildDungeonAttrs };
