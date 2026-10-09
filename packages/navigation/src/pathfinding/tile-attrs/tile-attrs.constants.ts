/* @layer shared-game @kind constants */
import { OVERWORLD_TILE_ATTRS } from '@rotp/game-data';
import { attrsOfCat } from './attrs-of-cat';
import { getHookshotTargetTiles } from './get-hookshot-target-tiles';

const TILE_ATTRS = OVERWORLD_TILE_ATTRS;

const FLOOR_ATTR = 0x00;
const PLAIN_DOOR_PASSAGE_ATTRS = { first: 0x80, last: 0x8d } as const;
const LAYER_TOGGLE_SHUTTER_ATTRS = { first: 0x90, last: 0xaf } as const;

const WATER_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'water');
const CLIFF_TRIGGER_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'cliff-trigger');
const CLIFF_FACE_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'cliff-face');
const PIT_TILES: ReadonlySet<number> = attrsOfCat(OVERWORLD_TILE_ATTRS, 'pit');
const HOOKSHOT_TARGET_TILES: ReadonlySet<number> = getHookshotTargetTiles(false);

export {
  CLIFF_FACE_TILES, CLIFF_TRIGGER_TILES, FLOOR_ATTR, HOOKSHOT_TARGET_TILES, LAYER_TOGGLE_SHUTTER_ATTRS,
  PIT_TILES, PLAIN_DOOR_PASSAGE_ATTRS, TILE_ATTRS, WATER_TILES,
};
