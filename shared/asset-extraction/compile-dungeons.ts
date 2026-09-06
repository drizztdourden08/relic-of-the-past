/* @layer shared-asset-extraction @kind logic */
/** Dungeon asset compilation: rooms, sprites, secrets, headers, attributes, entrances. */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { bufToArr } from './asset-builder';
import { decompress as lzDecompress } from './compression/lz-decompress';
import { buildDungeonRooms } from './compile-dungeon-rooms';
import { buildEntranceData } from './compile-dungeon-entrance';

const buildDungeonMap = (rom: RomData, A: AssetBuilder): void => {
  const kSizes = [75, 125, 50, 75, 175, 75, 50, 75, 50, 200, 150, 75, 100, 200];
  const layouts: Buffer[] = [];
  const tiles: Buffer[] = [];
  for (let i = 0; i < 14; i++) {
    const addr = 0xa0000 + rom.getWord(0x8AF605 + i * 2);
    const b = rom.getBytes(addr, kSizes[i]);
    const nonzero = kSizes[i] - Array.from(b).filter(x => x === 0xf).length;
    layouts.push(Buffer.from(b));
    const tileAddr = 0xa0000 + rom.getWord(0x8AFBE4 + i * 2);
    tiles.push(Buffer.from(rom.getBytes(tileAddr, nonzero)));
  }
  A.addPacked('kDungMap_FloorLayout', layouts);
  A.addPacked('kDungMap_Tiles', tiles);
};

const buildDungeonSprites = (rom: RomData, A: AssetBuilder): void => {
  const offsets = new Array(320).fill(0);
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

const buildEnemyDamageData = (rom: RomData, A: AssetBuilder): void => {
  const [data] = lzDecompress(0x83e800, (a) => rom.getByte(a), true, true);
  A.addUint8('kEnemyDamageData', Array.from(data));
};

const buildDungeonAttrs = (rom: RomData, A: AssetBuilder): void => {
  A.addUint16('kDungAttrsForTile_Offs', rom.getWords(0x8e9000, 21));
  A.addUint8('kDungAttrsForTile', bufToArr(rom.getBytes(0x8e902a, 1024)));
  A.addUint16('kMovableBlockDataInit', rom.getWords(0x84f1de, 198));
  A.addUint16('kTorchDataInit', rom.getWords(0x84F36A, 144));
  A.addUint16('kTorchDataJunk', rom.getWords(0x84F48a, 48));
};

const buildDefaultAndOverlayRooms = (rom: RomData, A: AssetBuilder): void => {
  // Entrance data must come first (matches C code asset order in assets.h)
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

export {
  buildDefaultAndOverlayRooms,
  buildDungeonAttrs,
  buildDungeonMap,
  buildDungeonRooms,
  buildDungeonSecrets,
  buildDungeonSprites,
  buildEnemyDamageData,
};
