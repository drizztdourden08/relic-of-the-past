/* @layer shared-game @kind logic */
/**
 * The catalog keys the dark-room settings occupy, derived from the light
 * fields so a light added to the data table brings its row with it. One key
 * for the requirement itself, one per light.
 */
import { DARK_ROOM_LIGHT_FIELDS } from './dark-room-lights.data';
import type { DarkRoomLightField } from './dark-room.type';

const DARK_ROOM_REQUIRED_KEY = 'dark_room_light_required';

const SNAKE_BY_FIELD: Readonly<Record<DarkRoomLightField, string>> = {
  lamp: 'lamp',
  fireRod: 'fire_rod',
  bombos: 'bombos',
  redCane: 'red_cane',
};

const darkRoomLightKeyOf = (field: DarkRoomLightField): string =>
  `dark_room_light_${SNAKE_BY_FIELD[field]}`;

const DARK_ROOM_LIGHT_KEYS: readonly string[] = DARK_ROOM_LIGHT_FIELDS.map(darkRoomLightKeyOf);

const DARK_ROOM_OPTION_KEYS: readonly string[] = [DARK_ROOM_REQUIRED_KEY, ...DARK_ROOM_LIGHT_KEYS];

const DARK_ROOM_KEY_SET: ReadonlySet<string> = new Set(DARK_ROOM_OPTION_KEYS);

/** True for a row the dark-room section owns — the requirement and its four lights. */
const isDarkRoomOptionKey = (key: string): boolean => DARK_ROOM_KEY_SET.has(key);

export {
  DARK_ROOM_LIGHT_KEYS,
  DARK_ROOM_OPTION_KEYS,
  DARK_ROOM_REQUIRED_KEY,
  darkRoomLightKeyOf,
  isDarkRoomOptionKey,
};
