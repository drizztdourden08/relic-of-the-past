/**
 * Extracts dungeon entrance and starting-point data from ROM.
 */
import type { RomData } from '../rom/rom-types';
import * as tables from './data/tables-data';

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

export { getEntranceInfo };
