/* @layer shared-game @kind data */
/**
 * The four lights and the item each one stands for.
 *
 * Carrying one is the whole rule: a ticked item lights an unlit room by being
 * in the inventory, with no meter charged, nothing held up and nothing to
 * activate (core/game-hooks/dark_room_lights.c answers the game's own "is a
 * light carried" question for all four). That is the lamp's own behaviour, and
 * it is deliberately the behaviour every ticked light gets, so the rules here
 * and the running game can only ever say the same thing.
 *
 * REFERENCE is the reference's own reading: light is required, and the lamp
 * alone provides it, the rule every seed rolled before this option existed
 * was generated under, and what an absent row still means. DEFAULT is where a
 * NEW profile starts: light required, and all four lights provide it.
 */
import { ITEM } from '../item-names.data';
import type { DarkRoomLightField, DarkRoomSetting } from './dark-room.type';

/** In the order the option rows are shown. */
const DARK_ROOM_LIGHT_FIELDS: readonly DarkRoomLightField[] = ['lamp', 'fireRod', 'bombos', 'redCane'];

/**
 * Of the two canes the red one is the cane that lays blocks, not the cane that
 * raises the blue barrier, and the art on the tile is the same lookup, so the
 * name here is what decides which colour the row shows.
 */
const DARK_ROOM_LIGHT_ITEMS: Readonly<Record<DarkRoomLightField, string>> = {
  lamp: ITEM.lamp,
  fireRod: ITEM.fireRod,
  bombos: ITEM.bombos,
  redCane: ITEM.caneOfSomaria,
};

const REFERENCE_DARK_ROOM_SETTING: DarkRoomSetting = {
  requireLight: true,
  lights: { lamp: true, fireRod: false, bombos: false, redCane: false },
};

const DEFAULT_DARK_ROOM_SETTING: DarkRoomSetting = {
  requireLight: true,
  lights: { lamp: true, fireRod: true, bombos: true, redCane: true },
};

export {
  DARK_ROOM_LIGHT_FIELDS,
  DARK_ROOM_LIGHT_ITEMS,
  DEFAULT_DARK_ROOM_SETTING,
  REFERENCE_DARK_ROOM_SETTING,
};
