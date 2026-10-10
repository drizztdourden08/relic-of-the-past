/* @layer tests @kind constants */
import type { ItemId } from '@rotp/game-data';

const BOW: ItemId = 'item-012';
const SWORD_1: ItemId = 'item-074';
const SWORD_4: ItemId = 'item-004';
const BOOMERANG: ItemId = 'item-013';
const FIRE_ROD: ItemId = 'item-008';

const GRID_SIZE = 20;
const BLOCKING_ATTR = 0x20;
const ANCILLA_COUNT = 57;
const DAMAGE_CLASS_COUNT = 16;
const ROOM_CLEAR_EXEMPT_FLAG = 0x40;
const ARROW_ANCILLA = 0x09;
const FIRE_ROD_ANCILLA = 0x02;

export {
  ANCILLA_COUNT, ARROW_ANCILLA, BLOCKING_ATTR, BOOMERANG, BOW, DAMAGE_CLASS_COUNT, FIRE_ROD, FIRE_ROD_ANCILLA,
  GRID_SIZE, ROOM_CLEAR_EXEMPT_FLAG, SWORD_1, SWORD_4,
};
