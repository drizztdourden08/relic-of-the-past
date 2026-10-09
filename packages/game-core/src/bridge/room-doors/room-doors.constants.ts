/* @layer bridge-wasm @kind constants */
import type { DoorDirection } from './room-doors.type';

const DIR_NAMES: Array<DoorDirection> = ['north', 'south', 'west', 'east'];
const ROOM_BANK_MASK = 0xff00;
const STAIR_DOWN_BIT = 4;
const STAIR_LAYER_BIT = 1;

export { DIR_NAMES, ROOM_BANK_MASK, STAIR_DOWN_BIT, STAIR_LAYER_BIT };
