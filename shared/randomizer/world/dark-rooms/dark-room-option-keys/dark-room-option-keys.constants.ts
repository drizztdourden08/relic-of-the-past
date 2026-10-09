/* @layer shared-game @kind constants */
import type { DarkRoomLightField } from '../dark-room.type';

const DARK_ROOM_REQUIRED_KEY = 'dark_room_light_required';

const DARK_ROOM_LIGHT_SNAKE_NAMES: Readonly<Record<DarkRoomLightField, string>> = {
  lamp: 'lamp',
  fireRod: 'fire_rod',
  bombos: 'bombos',
  redCane: 'red_cane',
};

export { DARK_ROOM_LIGHT_SNAKE_NAMES, DARK_ROOM_REQUIRED_KEY };
