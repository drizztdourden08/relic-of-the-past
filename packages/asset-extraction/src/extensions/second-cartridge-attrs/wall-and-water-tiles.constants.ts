/* @layer shared-asset-extraction @kind data */
import type { RoomCellPairs } from './second-cartridge-attrs.type';
import { WATER_ROOM } from './second-cartridge-attrs.constants';

const WALL_ART_TILES: readonly number[] = [
  0x15,
  0x90, 0x91, 0x92, 0x93, 0x94, 0x96, 0x97, 0x9e,
  0xa2, 0xa3, 0xa4, 0xa5, 0xa6,
  0x100, 0x101, 0x110, 0x111, 0x112, 0x113, 0x11c,
  0x12c, 0x18e, 0x18f, 0x19e, 0x19f,
];

const WATER_RIM_TILES: readonly number[] = [0x43, 0x50, 0x51, 0x53];

const WATER_LEDGES: RoomCellPairs = {
  [WATER_ROOM]: [
    [48, 54], [49, 54],
    [42, 12], [43, 12],
  ],
};

const WATER_LEDGE_SIDES: RoomCellPairs = {
  [WATER_ROOM]: [
    [47, 54], [50, 54],
    [41, 12], [44, 12],
  ],
};

export { WALL_ART_TILES, WATER_LEDGES, WATER_LEDGE_SIDES, WATER_RIM_TILES };
