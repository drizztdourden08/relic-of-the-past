/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { decompress as lzDecompress } from '../compression/lz-decompress';

const buildEnemyDamageData = (rom: RomData, A: AssetBuilder): void => {
  const [data] = lzDecompress(0x83e800, (a) => rom.getByte(a), true, true);
  A.addUint8('kEnemyDamageData', Array.from(data));
};

export { buildEnemyDamageData };
