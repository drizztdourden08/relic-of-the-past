/* @layer shared-game @kind logic */
import { DARK_ROOM_LIGHT_FIELDS } from './dark-room-lights.data';
import { forcedDarkRoomLightReasons } from './forced-dark-room-light-reasons';
import type { DarkRoomLights } from './dark-room.type';

const maskDarkRoomLights = (lights: DarkRoomLights, includeWorldItems: boolean): DarkRoomLights => {
  const forced = forcedDarkRoomLightReasons(includeWorldItems);
  if (forced.size === 0) return lights;
  return Object.fromEntries(DARK_ROOM_LIGHT_FIELDS.map((field) =>
    [field, forced.has(field) ? false : lights[field]])) as unknown as DarkRoomLights;
};

export { maskDarkRoomLights };
