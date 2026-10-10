/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { appendScanBytes } from './append-scan-bytes';
import { copyRoomObjects } from './copy-room-objects';
import { readDungeonChests } from './read-dungeon-chests';
import { readRoomHeader } from './read-room-header';

const readPitsHurt = (rom: RomData): number[] => {
  const pitsSet = new Set<number>();
  for (let i = 0; i < 57; i++) {
    pitsSet.add(rom.getWord(0x80990c + i * 2));
  }
  const pitsHurt: number[] = [];
  for (let i = 0; i < 320; i++) {
    if (pitsSet.has(i)) pitsHurt.push(i);
  }
  return pitsHurt;
};

const buildDungeonRooms = (rom: RomData, A: AssetBuilder): void => {
  const data: number[] = [];
  const offsets = new Array<number>(320).fill(0);
  const doorOffsets = new Array<number>(320).fill(0);
  const roomHeaders: number[] = [];
  const headerOffsets = new Array<number>(320).fill(0);
  const signTexts = new Array<number>(320).fill(0);

  for (let i = 0; i < 320; i++) {
    const p = 0x1f8000 + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    signTexts[i] = rom.getWord(0x87f61d + i * 2);
    headerOffsets[i] = appendScanBytes(roomHeaders, readRoomHeader(rom, i));

    offsets[i] = data.length;
    data.push(rom.getByte(roomAddr), rom.getByte(roomAddr + 1));
    doorOffsets[i] = copyRoomObjects(rom, roomAddr, data);
  }

  A.addUint8('kDungeonRoom', data);
  A.addUint16('kDungeonRoomOffs', offsets);
  A.addUint16('kDungeonRoomDoorOffs', doorOffsets);
  A.addUint8('kDungeonRoomHeaders', roomHeaders);
  A.addUint16('kDungeonRoomHeadersOffs', headerOffsets);
  A.addUint8('kDungeonRoomChests', readDungeonChests(rom));
  A.addUint16('kDungeonRoomTeleMsg', signTexts);
  A.addUint16('kDungeonPitsHurtPlayer', readPitsHurt(rom));
};

export { buildDungeonRooms };
