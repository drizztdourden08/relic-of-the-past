/**
 * Decodes room objects (tiles) and doors from ROM data for dungeon rooms.
 */
import type { RomData } from '../rom/rom-types';
import * as tables from './tables-data';

interface RoomObject {
  x: number;
  y: number;
  n: string;
  s?: string;
}

interface Door {
  type: number;
  pos: number;
  dir: number;
}

const decodeRoomObjects = (rom: RomData, p: number): { end: number; objs: RoomObject[]; doors: Door[] | null } => {
  const objs: RoomObject[] = [];
  while (true) {
    const p0 = rom.getByte(p);
    const p1 = rom.getByte(p + 1);
    const p2 = rom.getByte(p + 2);
    const A = p0 | (p1 << 8);

    if (A === 0xffff) return { end: p + 2, objs, doors: null };
    if (A === 0xfff0) { p += 2; break; }

    if ((A & 0xfc) !== 0xfc) {
      const index = p2;
      const Dst = ((p1 >> 2) << 7) | ((p0 & 0xfc) >> 1);
      const X = (Dst >> 1) & 0x3f;
      const Y = (Dst >> 7) & 0x3f;
      const W = p0 & 3;
      const H = p1 & 3;
      if (index < 0xf8) {
        objs.push({ x: X, y: Y, s: `${W}*${H}`, n: tables.kType0Names[index] });
      } else {
        const index2 = ((index & 7) << 4) | (H << 2) | W;
        objs.push({ x: X, y: Y, n: tables.kType1Names[index2] });
      }
    } else {
      // subtype 2
      const X = ((p0 << 4) | (p1 >> 4)) & 0x3f;
      const Y = ((p1 << 2) | (p2 >> 6)) & 0x3f;
      const index = p2 & 0x3f;
      objs.push({ x: X, y: Y, n: tables.kType2Names[index] });
    }
    p += 3;
  }

  // Doors
  const doors: Door[] = [];
  while (true) {
    const A = rom.getByte(p) | (rom.getByte(p + 1) << 8);
    if (A === 0xffff) return { end: p + 2, objs, doors };
    doors.push({ type: rom.getByte(p + 1), pos: rom.getByte(p) >> 4, dir: A & 3 });
    p += 2;
  }
};

export { decodeRoomObjects };
export type { Door, RoomObject };
