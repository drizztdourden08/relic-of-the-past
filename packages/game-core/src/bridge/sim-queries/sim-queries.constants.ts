/* @layer bridge-wasm @kind constants */
import type { SimDoorDirection } from './sim-queries.type';

const DUNG_INFO_LEN = 320;
const OW_EVENT_LEN = 0x82;
const PROGRESS_LEN = 21;
const DIR_NAMES: SimDoorDirection[] = ['north', 'south', 'west', 'east'];
const SPRITE_FLOOR_BIT = 1;
const SPRITE_SMALL_KEY_BIT = 2;
const SPRITE_BIG_KEY_BIT = 4;

export {
  DUNG_INFO_LEN, OW_EVENT_LEN, PROGRESS_LEN, DIR_NAMES, SPRITE_FLOOR_BIT, SPRITE_SMALL_KEY_BIT, SPRITE_BIG_KEY_BIT,
};
