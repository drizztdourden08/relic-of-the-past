/**
 * Dungeon room extraction — ROM → YAML data for all 320 rooms + overlays + defaults.
 *
 * Ported from: core/zelda3/assets/extract_resources.py (dungeon portion)
 */
import * as yaml from 'js-yaml';
import type { RomData } from '../rom/rom-types';
import * as tables from './tables-data';

// ─── Room object decoding ───

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

function decodeRoomObjects(rom: RomData, p: number): { end: number; objs: RoomObject[]; doors: Door[] | null } {
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
}

// ─── Entrance info ───

function getEntranceInfo(rom: RomData, set: 0 | 1): Map<number, Record<string, unknown>[]> {
  const r = new Map<number, Record<string, unknown>[]>();
  const count = set === 0 ? 133 : 7;
  const kQuadrantNames: Record<number, string> = { 0: 'upper_left', 2: 'lower_left', 16: 'upper_right', 18: 'lower_right' };

  for (let i = 0; i < count; i++) {
    const roomAddr = [0x82c813, 0x82db6e][set];
    const room = rom.getWord(roomAddr + i * 2);

    const playerX = rom.getWord([0x82d063, 0x82dbde][set] + i * 2) - ((room & 0x00f) << 9);
    const playerY = rom.getWord([0x82cf59, 0x82dbd0][set] + i * 2) - ((room & 0x1f0) << 5);

    const quadByte = rom.getByte([0x82d61a, 0x82dc24][set] + i);
    const quadrants = [
      (quadByte & 0x20) !== 0 ? 'double_x' : 'single_x',
      (quadByte & 0x2) !== 0 ? 'double_y' : 'single_y',
      kQuadrantNames[rom.getByte([0x82d69f, 0x82dc2b][set] + i)] ?? 'unknown',
    ];

    const y: Record<string, unknown> = {
      [set === 0 ? 'entrance_index' : 'starting_point_index']: i,
      name: set === 0 ? tables.kEntranceNames[i] : `Starting Location ${i}`,
      scroll_xy: [
        rom.getWord([0x82cd45, 0x82dbb4][set] + i * 2) - ((room & 0x00f) << 9),
        rom.getWord([0x82ce4f, 0x82dbc2][set] + i * 2) - ((room & 0x1f0) << 5),
      ],
      player_xy: [playerX, playerY],
      camera_xy: [
        rom.getWord([0x82d277, 0x82dbfa][set] + i * 2),
        rom.getWord([0x82d16d, 0x82dbec][set] + i * 2),
      ],
      blockset: rom.getByte([0x82d381, 0x82dc08][set] + i),
      music: tables.kMusicNames[rom.getByte([0x82d82e, 0x82dc4e][set] + i)],
      palace: tables.kPalaceNames[((rom.getInt8([0x82d48b, 0x82dc16][set] + i)) + 2) >> 1],
      doorway_orientation: set === 0 ? rom.getInt8(0x82d510 + i) : 0,
      plane: rom.getByte([0x82d595, 0x82dc1d][set] + i) & 0xf,
      ladder_level: rom.getByte([0x82d595, 0x82dc1d][set] + i) >> 4,
      quadrants,
      floor: rom.getInt8([0x82d406, 0x82dc0f][set] + i),
    };

    // Scroll bounds repair
    const seBase = [0x82c91d, 0x82db7c][set];
    const baseXr = (room & 0xf) * 2;
    const baseYr = (room >> 4) * 2;
    const ym = ((playerY & 0x100) >> 8);
    const xm = ((playerX & 0x100) >> 8);
    const qqq = (xm && room >= 242 && quadrants[0] === 'single_x') ? xm : 0;
    const se = [
      rom.getByte(seBase + i * 8 + 0) - baseYr - ym,
      rom.getByte(seBase + i * 8 + 1) - baseYr,
      rom.getByte(seBase + i * 8 + 2) - baseYr - ym,
      rom.getByte(seBase + i * 8 + 3) - baseYr - 1,
      rom.getByte(seBase + i * 8 + 4) - baseXr - xm,
      rom.getByte(seBase + i * 8 + 5) - baseXr - qqq,
      rom.getByte(seBase + i * 8 + 6) - baseXr - xm,
      rom.getByte(seBase + i * 8 + 7) - baseXr - 1 - qqq,
    ];
    if (se.some(v => v !== 0)) {
      y.repair_scroll_bounds = se;
    }

    // Exit door
    const exitDoorVal = rom.getWord([0x82d724, 0x82dc32][set] + i * 2);
    if (exitDoorVal === 0) {
      y.house_exit_door = ['none'];
    } else if (exitDoorVal === 0xffff) {
      y.house_exit_door = ['none_0xffff'];
    } else {
      y.house_exit_door = [exitDoorVal & 0x8000 ? 'bombable' : 'wooden', (exitDoorVal & 0x7e) >> 1, (exitDoorVal & 0x3f80) >> 7];
    }

    if (set === 1) {
      y.associated_entrance_index = rom.getWord(0x82dc40 + i * 2);
    }

    if (!r.has(room)) r.set(room, []);
    r.get(room)!.push(y);
  }
  return r;
}

// ─── Chest info ───

function getChestInfo(rom: RomData): Map<number, [number, boolean][]> {
  const all = new Map<number, [number, boolean][]>();
  const ea = 0x81e96e;
  for (let i = 0; i < 168; i++) {
    const room = rom.getWord(ea + i * 3);
    const data = rom.getByte(ea + i * 3 + 2);
    const key = room & 0x7fff;
    if (!all.has(key)) all.set(key, []);
    all.get(key)!.push([data, (room & 0x8000) !== 0]);
  }
  return all;
}

// ─── Pits hurt player ───

function pitsHurtPlayer(rom: RomData): Set<number> {
  const s = new Set<number>();
  for (let i = 0; i < 57; i++) {
    s.add(rom.getWord(0x80990c + i * 2));
  }
  return s;
}

// ─── Room extraction ───

function extractRoom(rom: RomData, roomIndex: number, entrances0: Map<number, Record<string, unknown>[]>,
  entrances1: Map<number, Record<string, unknown>[]>, chestInfo: Map<number, [number, boolean][]>,
  pitsHurt: Set<number>): string {

  let p = 0x1f8000 + roomIndex * 3;
  const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
  p = 0x40000 | rom.getWord(0x4f502 + roomIndex * 2);
  if (p === 0x4ffef) p = 0x82edc5;

  const floor = rom.getByte(roomAddr);
  const layout = rom.getByte(roomAddr + 1);
  const flags = rom.getByte(p + 0);
  const p7 = rom.getByte(p + 7);
  const p8 = rom.getByte(p + 8);

  let ea = 0x890000 + rom.getWord(0x89d62e + roomIndex * 2);
  const sortSprites = rom.getByte(ea);

  const header: Record<string, unknown> = {
    floor1: floor & 0xf,
    floor2: floor >> 4,
    layout: layout >> 2,
    start_quadrant: layout & 3,
    bg2: tables.kBg2[flags >> 5],
    collision: tables.kCollisionNames[(flags >> 2) & 7],
    lights_out: flags & 1,
    palette: rom.getByte(p + 1),
    blockset: rom.getByte(p + 2),
    enemyblk: rom.getByte(p + 3),
    effect: tables.kEffectNames[rom.getByte(p + 4)],
    tag0: tables.kTagNames[rom.getByte(p + 5)],
    tag1: tables.kTagNames[rom.getByte(p + 6)],
    hole0_dest: [rom.getByte(p + 9), p7 & 3],
    stair0_dest: [rom.getByte(p + 10), (p7 >> 2) & 3],
    stair1_dest: [rom.getByte(p + 11), (p7 >> 4) & 3],
    stair2_dest: [rom.getByte(p + 12), (p7 >> 6) & 3],
    stair3_dest: [rom.getByte(p + 13), p8 & 3],
    tele_msg: rom.getWord(0x87f61d + roomIndex * 2),
    sort_sprites: sortSprites,
    pits_hurt_player: pitsHurt.has(roomIndex),
  };

  // Sprites
  ea = 0x890000 + rom.getWord(0x89d62e + roomIndex * 2) + 1;
  const sprites: unknown[] = [];
  while (rom.getByte(ea) !== 0xff) {
    const sy = rom.getByte(ea);
    const sx = rom.getByte(ea + 1);
    const type = rom.getByte(ea + 2);
    if (type === 0xe4) {
      if (sy === 0xfe || sy === 0xfd) {
        const last = sprites[sprites.length - 1] as unknown[];
        last.push(sy === 0xfe ? 'drop_key' : 'drop_big_key');
        ea += 3;
        continue;
      }
    } else if (sx >= 0xe0) {
      const flr = sy >> 7;
      sprites.push([sx & 0x1f, sy & 0x1f, flr ? 'lower' : 'upper', tables.kSpriteNames[type + 0x100]]);
      ea += 3;
      continue;
    }
    const subtype = (sx >> 5) | (((sy >> 5) & 3) << 3);
    const flr = sy >> 7;
    let name = tables.kSpriteNames[type];
    if (subtype !== 0) {
      const dashIdx = name.indexOf('-');
      name = name.slice(0, dashIdx) + `.${subtype}` + name.slice(dashIdx);
    }
    sprites.push([sx & 0x1f, sy & 0x1f, flr ? 'lower' : 'upper', name]);
    ea += 3;
  }

  // Secrets
  let secretEa = 0x810000 | rom.getWord(0x81db69 + roomIndex * 2);
  const secrets: unknown[] = [];
  while (rom.getWord(secretEa) !== 0xffff) {
    const pos = rom.getWord(secretEa);
    const x = ((pos / 2) | 0) % 64;
    const y = ((pos / 2) | 0) / 64 | 0;
    secrets.push([x, y, tables.kSecretNames[rom.getByte(secretEa + 2)]]);
    secretEa += 3;
  }

  // Chests
  const chests: (number | string)[] = [];
  for (const [data, big] of chestInfo.get(roomIndex) ?? []) {
    chests.push(big ? `${data}!` : data);
  }

  const data: Record<string, unknown> = {
    Header: header,
    Sprites: sprites,
    Secrets: secrets,
    Chests: chests,
  };
  data.Entrances = entrances0.get(roomIndex) ?? [];
  if (entrances1.has(roomIndex)) {
    data.StartingPoints = entrances1.get(roomIndex);
  }

  // Room objects (3 layers)
  let objP = roomAddr + 2;
  const layer1 = decodeRoomObjects(rom, objP);
  data.Layer1 = layer1.objs;
  if (layer1.doors) data['Layer1.doors'] = layer1.doors;
  objP = layer1.end;

  const layer2 = decodeRoomObjects(rom, objP);
  data.Layer2 = layer2.objs;
  if (layer2.doors) data['Layer2.doors'] = layer2.doors;
  objP = layer2.end;

  const layer3 = decodeRoomObjects(rom, objP);
  data.Layer3 = layer3.objs;
  if (layer3.doors) data['Layer3.doors'] = layer3.doors;

  return yaml.dump(data, { flowLevel: -1, sortKeys: false });
}

/**
 * Extract all 320 dungeon rooms from ROM.
 * @returns Map of filename → YAML content
 */
export function extractAllDungeonRooms(rom: RomData): Map<string, string> {
  const entrances0 = getEntranceInfo(rom, 0);
  const entrances1 = getEntranceInfo(rom, 1);
  const chestInfoMap = getChestInfo(rom);
  const pitsHurt = pitsHurtPlayer(rom);

  const results = new Map<string, string>();
  for (let i = 0; i < 320; i++) {
    results.set(`dungeon/dungeon-${i}.yaml`, extractRoom(rom, i, entrances0, entrances1, chestInfoMap, pitsHurt));
  }
  return results;
}

/**
 * Extract default rooms (8 entries).
 */
export function extractDefaultRooms(rom: RomData): string {
  const defaultRooms: Record<string, RoomObject[]> = {};
  for (let i = 0; i < 8; i++) {
    const p = 0x84ef2f + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    const { objs } = decodeRoomObjects(rom, roomAddr);
    defaultRooms[`Default${i}`] = objs;
  }
  return yaml.dump(defaultRooms, { flowLevel: -1, sortKeys: false });
}

/**
 * Extract overlay rooms (19 entries).
 */
export function extractOverlayRooms(rom: RomData): string {
  const overlayRooms: Record<string, RoomObject[]> = {};
  for (let i = 0; i < 19; i++) {
    const p = 0x84ecc0 + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    const { objs } = decodeRoomObjects(rom, roomAddr);
    overlayRooms[`Overlay${i}`] = objs;
  }
  return yaml.dump(overlayRooms, { flowLevel: -1, sortKeys: false });
}

/**
 * Extract map32_to_map16 data.
 */
export function extractMap32ToMap16(rom: RomData): string {
  const lines: string[] = [];
  const getit = (ea: number): number[] => {
    const ov = [0, 1, 2, 3, 4, 5].map(j => rom.getByte(ea + j));
    return [
      ov[0] | ((ov[4] >> 4) << 8),
      ov[1] | ((ov[4] & 0xf) << 8),
      ov[2] | ((ov[5] >> 4) << 8),
      ov[3] | ((ov[5] & 0xf) << 8),
    ];
  };
  for (let i = 0; i < 2218; i++) {
    const t0 = getit(0x838000 + i * 6);
    const t1 = getit(0x83b400 + i * 6);
    const t2 = getit(0x848000 + i * 6);
    const t3 = getit(0x84b400 + i * 6);
    for (let j = 0; j < 4; j++) {
      lines.push(`${String(i * 4 + j).padStart(5)}: ${String(t0[j]).padStart(4)}, ${String(t1[j]).padStart(4)}, ${String(t2[j]).padStart(4)}, ${String(t3[j]).padStart(4)}`);
    }
  }
  return lines.join('\n') + '\n';
}
