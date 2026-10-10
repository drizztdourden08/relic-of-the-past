/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';

const buildPlayerGraphics = (rom: RomData, A: AssetBuilder): void => {
  const height = 448;
  const raw = rom.getBytes(0x108000, 0x800 * height / 32);
  const result: number[] = [];
  for (let tile = 0; tile < 16 * (height / 8); tile++) {
    const srcOff = tile * 32;
    for (let b = 0; b < 32; b++) result.push(raw.readUInt8(srcOff + b));
  }
  A.addUint8('kLinkGraphics', result);
};

export { buildPlayerGraphics };
