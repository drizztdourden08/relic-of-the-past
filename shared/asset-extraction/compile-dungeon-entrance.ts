/**
 * Dungeon entrance data compilation — entrance positions, cameras, blocksets, starting points.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';

const buildEntranceData = (rom: RomData, A: AssetBuilder, set: 0 | 1, count: number, prefix: string): void => {
  const rooms: number[] = [];
  const relCoords: number[] = [];
  const scrollX: number[] = [];
  const scrollY: number[] = [];
  const playerX: number[] = [];
  const playerY: number[] = [];
  const cameraX: number[] = [];
  const cameraY: number[] = [];
  const blockset: number[] = [];
  const floor: number[] = [];
  const palace: number[] = [];
  const doorway: number[] = [];
  const startBg: number[] = [];
  const quad1: number[] = [];
  const quad2: number[] = [];
  const doorSettings: number[] = [];
  const music: number[] = [];
  const entrance: number[] = [];

  const roomAddr = [0x82c813, 0x82db6e][set];
  const seBase = [0x82c91d, 0x82db7c][set];

  for (let i = 0; i < count; i++) {
    const room = rom.getWord(roomAddr + i * 2);
    rooms.push(room);

    scrollX.push(rom.getWord([0x82cd45, 0x82dbb4][set] + i * 2));
    scrollY.push(rom.getWord([0x82ce4f, 0x82dbc2][set] + i * 2));
    playerX.push(rom.getWord([0x82d063, 0x82dbde][set] + i * 2));
    playerY.push(rom.getWord([0x82cf59, 0x82dbd0][set] + i * 2));
    cameraX.push(rom.getWord([0x82d277, 0x82dbfa][set] + i * 2));
    cameraY.push(rom.getWord([0x82d16d, 0x82dbec][set] + i * 2));
    blockset.push(rom.getByte([0x82d381, 0x82dc08][set] + i));
    floor.push(rom.getInt8([0x82d406, 0x82dc0f][set] + i));
    palace.push(rom.getInt8([0x82d48b, 0x82dc16][set] + i));
    doorway.push(set === 0 ? rom.getInt8(0x82d510 + i) : 0);
    startBg.push(rom.getByte([0x82d595, 0x82dc1d][set] + i));
    quad1.push(rom.getByte([0x82d61a, 0x82dc24][set] + i));
    quad2.push(rom.getByte([0x82d69f, 0x82dc2b][set] + i));
    doorSettings.push(rom.getWord([0x82d724, 0x82dc32][set] + i * 2));
    music.push(rom.getByte([0x82d82e, 0x82dc4e][set] + i));

    for (let j = 0; j < 8; j++) {
      relCoords.push(rom.getByte(seBase + i * 8 + j));
    }

    if (set === 1) {
      entrance.push(rom.getWord(0x82dc40 + i * 2));
    }
  }

  A.addUint16(prefix + 'rooms', rooms);
  A.addUint8(prefix + 'relativeCoords', relCoords);
  A.addUint16(prefix + 'scrollX', scrollX);
  A.addUint16(prefix + 'scrollY', scrollY);
  A.addUint16(prefix + 'playerX', playerX);
  A.addUint16(prefix + 'playerY', playerY);
  A.addUint16(prefix + 'cameraX', cameraX);
  A.addUint16(prefix + 'cameraY', cameraY);
  A.addUint8(prefix + 'blockset', blockset);
  A.addInt8(prefix + 'floor', floor);
  A.addInt8(prefix + 'palace', palace);
  A.addUint8(prefix + 'doorwayOrientation', doorway);
  A.addUint8(prefix + 'startingBg', startBg);
  A.addUint8(prefix + 'quadrant1', quad1);
  A.addUint8(prefix + 'quadrant2', quad2);
  A.addUint16(prefix + 'doorSettings', doorSettings);
  if (set === 1) A.addUint8(prefix + 'entrance', entrance);
  A.addUint8(prefix + 'musicTrack', music);
};

export { buildEntranceData };
