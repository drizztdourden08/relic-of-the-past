/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { buildEntranceData } from './build-entrance-data';

const copyRoomLayer = (rom: RomData, addr: number, out: number[]): void => {
  let p = addr;
  while (true) {
    const w = rom.getByte(p) | (rom.getByte(p + 1) << 8);
    if (w === 0xffff) { out.push(0xff, 0xff); break; }
    if (w === 0xfff0) { out.push(0xf0, 0xff); p += 2; continue; }
    out.push(rom.getByte(p), rom.getByte(p + 1), rom.getByte(p + 2));
    p += 3;
  }
};

const buildDefaultAndOverlayRooms = (rom: RomData, A: AssetBuilder): void => {
  buildEntranceData(rom, A, 0, 133, 'kEntranceData_');
  buildEntranceData(rom, A, 1, 7, 'kStartingPoint_');

  const defaultData: number[] = [];
  const defaultOffs = new Array(8).fill(0);
  for (let i = 0; i < 8; i++) {
    const p = 0x84ef2f + i * 3;
    const addr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    defaultOffs[i] = defaultData.length;
    copyRoomLayer(rom, addr, defaultData);
  }
  A.addUint8('kDungeonRoomDefault', defaultData);
  A.addUint16('kDungeonRoomDefaultOffs', defaultOffs);

  const overlayData: number[] = [];
  const overlayOffs = new Array(19).fill(0);
  for (let i = 0; i < 19; i++) {
    const p = 0x84ecc0 + i * 3;
    const addr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    overlayOffs[i] = overlayData.length;
    copyRoomLayer(rom, addr, overlayData);
  }
  A.addUint8('kDungeonRoomOverlay', overlayData);
  A.addUint16('kDungeonRoomOverlayOffs', overlayOffs);
};

export { buildDefaultAndOverlayRooms };
