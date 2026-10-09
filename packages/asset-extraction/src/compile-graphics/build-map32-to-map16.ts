/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { bufToArr } from '../asset-builder';

const buildMap32ToMap16 = (rom: RomData, A: AssetBuilder): void => {
  A.addUint8('kMap32ToMap16_0', bufToArr(rom.getBytes(0x838000, 2218 * 6)));
  A.addUint8('kMap32ToMap16_1', bufToArr(rom.getBytes(0x83b400, 2218 * 6)));
  A.addUint8('kMap32ToMap16_2', bufToArr(rom.getBytes(0x848000, 2218 * 6)));
  A.addUint8('kMap32ToMap16_3', bufToArr(rom.getBytes(0x84b400, 2218 * 6)));
};

export { buildMap32ToMap16 };
