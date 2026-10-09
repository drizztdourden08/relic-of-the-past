/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { bufToArr } from '../asset-builder';

const buildTilemaps = (rom: RomData, A: AssetBuilder): void => {
  const kSrcs = [0xcdd6d, 0xce7bf, 0xce2a8, 0xce63c, 0xce456, 0xeda9c];
  for (let i = 0; i < kSrcs.length; i++) {
    let p = kSrcs[i];
    const pOrg = p;
    while (!(rom.getByte(p) & 0x80)) {
      const isMemset = rom.getByte(p + 2) & 0x40;
      const len = ((rom.getByte(p + 2) * 256 + rom.getByte(p + 3)) & 0x3fff) + 1;
      p += 4;
      p += isMemset ? 2 : len;
    }
    const totalLen = p - pOrg + 1;
    A.addUint8(`kBgTilemap_${i}`, bufToArr(rom.getBytes(pOrg, totalLen)));
  }
};

export { buildTilemaps };
