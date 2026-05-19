/**
 * Dungeon asset compilation — rooms, sprites, secrets, headers, attributes, entrances.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { bufToArr } from './asset-builder';
import { decompress as lzDecompress } from './compression/lz-decompress';

function buildDungeonMap(rom: RomData, A: AssetBuilder): void {
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
}

function buildDungeonSprites(rom: RomData, A: AssetBuilder): void {
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
}

function buildDungeonSecrets(rom: RomData, A: AssetBuilder): void {
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
}

function buildDungeonRooms(rom: RomData, A: AssetBuilder): void {
  const data: number[] = [];
  const offsets = new Array(320).fill(0);
  const doorOffsets = new Array(320).fill(0);
  const roomHeaders: number[] = [];
  const headerOffsets = new Array(320).fill(0);
  const chests: number[] = [];
  const signTexts = new Array(320).fill(0);
  const pitsHurt: number[] = [];

  for (let i = 0; i < 320; i++) {
    let p = 0x1f8000 + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);

    p = 0x40000 | rom.getWord(0x4f502 + i * 2);
    if (p === 0x4ffef) p = 0x82edc5;

    const floor = rom.getByte(roomAddr);
    const layout = rom.getByte(roomAddr + 1);
    const flags = rom.getByte(p + 0);
    const p7val = rom.getByte(p + 7);
    const p8val = rom.getByte(p + 8);

    signTexts[i] = rom.getWord(0x87f61d + i * 2);

    const hdr = [
      (flags >> 5) << 5 | ((flags >> 2) & 7) << 2 | (flags & 1),
      rom.getByte(p + 1), rom.getByte(p + 2), rom.getByte(p + 3),
      rom.getByte(p + 4), rom.getByte(p + 5), rom.getByte(p + 6),
      p7val, p8val & 3,
      rom.getByte(p + 9), rom.getByte(p + 10), rom.getByte(p + 11), rom.getByte(p + 12), rom.getByte(p + 13),
    ];

    headerOffsets[i] = appendScanBytes(roomHeaders, hdr);

    offsets[i] = data.length;
    data.push(floor, layout);

    let objP = roomAddr + 2;
    for (let layer = 0; layer < 3; layer++) {
      while (true) {
        const w = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
        if (w === 0xffff) { data.push(0xff, 0xff); objP += 2; break; }
        if (w === 0xfff0) {
          data.push(0xf0, 0xff);
          objP += 2;
          if (layer === 2) doorOffsets[i] = data.length;
          while (true) {
            const dw = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
            if (dw === 0xffff) { data.push(0xff, 0xff); objP += 2; break; }
            data.push(rom.getByte(objP), rom.getByte(objP + 1));
            objP += 2;
          }
          break;
        }
        data.push(rom.getByte(objP), rom.getByte(objP + 1), rom.getByte(objP + 2));
        objP += 3;
      }
    }
  }

  // Pits that hurt player
  const pitsSet = new Set<number>();
  for (let i = 0; i < 57; i++) {
    pitsSet.add(rom.getWord(0x80990c + i * 2));
  }
  for (let i = 0; i < 320; i++) {
    if (pitsSet.has(i)) pitsHurt.push(i);
  }

  // Chests — handle big chest flag
  const chestAddr = 0x81e96e;
  const chestsByRoom = new Map<number, { item: number; big: boolean }[]>();
  for (let i = 0; i < 168; i++) {
    const roomWord = rom.getWord(chestAddr + i * 3);
    const item = rom.getByte(chestAddr + i * 3 + 2);
    const room = roomWord & 0x7fff;
    const big = (roomWord & 0x8000) !== 0;
    if (!chestsByRoom.has(room)) chestsByRoom.set(room, []);
    chestsByRoom.get(room)!.push({ item, big });
  }
  for (let i = 0; i < 320; i++) {
    const roomChests = chestsByRoom.get(i);
    if (!roomChests) continue;
    for (const c of roomChests) {
      chests.push(i & 0xff, (i >> 8) | (c.big ? 0x80 : 0), c.item);
    }
  }

  A.addUint8('kDungeonRoom', data);
  A.addUint16('kDungeonRoomOffs', offsets);
  A.addUint16('kDungeonRoomDoorOffs', doorOffsets);
  A.addUint8('kDungeonRoomHeaders', roomHeaders);
  A.addUint16('kDungeonRoomHeadersOffs', headerOffsets);
  A.addUint8('kDungeonRoomChests', chests);
  A.addUint16('kDungeonRoomTeleMsg', signTexts);
  A.addUint16('kDungeonPitsHurtPlayer', pitsHurt);

  buildEntranceData(rom, A, 0, 133, 'kEntranceData_');
  buildEntranceData(rom, A, 1, 7, 'kStartingPoint_');
}

function buildEntranceData(rom: RomData, A: AssetBuilder, set: 0 | 1, count: number, prefix: string): void {
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

    const pX = rom.getWord([0x82d063, 0x82dbde][set] + i * 2);
    const pY = rom.getWord([0x82cf59, 0x82dbd0][set] + i * 2);
    const sX = rom.getWord([0x82cd45, 0x82dbb4][set] + i * 2);
    const sY = rom.getWord([0x82ce4f, 0x82dbc2][set] + i * 2);
    scrollX.push(sX);
    scrollY.push(sY);
    playerX.push(pX);
    playerY.push(pY);
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
}

function buildEnemyDamageData(rom: RomData, A: AssetBuilder): void {
  const [data] = lzDecompress(0x83e800, (a) => rom.getByte(a), true, true);
  A.addUint8('kEnemyDamageData', Array.from(data));
}

function buildDungeonAttrs(rom: RomData, A: AssetBuilder): void {
  A.addUint16('kDungAttrsForTile_Offs', rom.getWords(0x8e9000, 21));
  A.addUint8('kDungAttrsForTile', bufToArr(rom.getBytes(0x8e902a, 1024)));
  A.addUint16('kMovableBlockDataInit', rom.getWords(0x84f1de, 198));
  A.addUint16('kTorchDataInit', rom.getWords(0x84F36A, 144));
  A.addUint16('kTorchDataJunk', rom.getWords(0x84F48a, 48));
}

function buildDefaultAndOverlayRooms(rom: RomData, A: AssetBuilder): void {
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
}

// ─── Helpers ───

/** Copy a single room object layer from ROM into output array */
function copyRoomLayer(rom: RomData, addr: number, out: number[]): void {
  let p = addr;
  while (true) {
    const w = rom.getByte(p) | (rom.getByte(p + 1) << 8);
    if (w === 0xffff) { out.push(0xff, 0xff); break; }
    if (w === 0xfff0) { out.push(0xf0, 0xff); p += 2; continue; }
    out.push(rom.getByte(p), rom.getByte(p + 1), rom.getByte(p + 2));
    p += 3;
  }
}

/** Append bytes to a growing array using scan-match deduplication */
function appendScanBytes(big: number[], little: number[]): number {
  for (let n = little.length; n >= 0; n--) {
    if (n === 0) {
      const offset = big.length;
      big.push(...little);
      return offset;
    }
    let match = true;
    for (let k = 0; k < n; k++) {
      if (big[big.length - n + k] !== little[k]) { match = false; break; }
    }
    if (match) {
      const offset = big.length - n;
      big.push(...little.slice(n));
      return offset;
    }
  }
  const offset = big.length;
  big.push(...little);
  return offset;
}

export {
  buildDefaultAndOverlayRooms,
  buildDungeonAttrs,
  buildDungeonMap,
  buildDungeonRooms,
  buildDungeonSecrets,
  buildDungeonSprites,
  buildEnemyDamageData,
};
