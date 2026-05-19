/**
 * Dungeon room data compilation — room objects, chests, pits, headers.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';

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

    const floor = rom.getByte(roomAddr);
    const layout = rom.getByte(roomAddr + 1);
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

export { buildDungeonRooms };
