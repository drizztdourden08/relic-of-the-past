/* @layer shared-game @kind logic */
import { recordBy } from '../../keyed-record';
import { DARK_ROOM_LIGHT_FIELDS } from './dark-room-lights.constants';
import { forcedDarkRoomLightReasons } from './forced-dark-room-light-reasons';
import type { DarkRoomLights } from '@rotp/game-core';

const maskDarkRoomLights = (lights: DarkRoomLights, includeWorldItems: boolean): DarkRoomLights => {
  const forced = forcedDarkRoomLightReasons(includeWorldItems);
  if (forced.size === 0) return lights;
  return recordBy(DARK_ROOM_LIGHT_FIELDS, (field) => field, (field) => (forced.has(field) ? false : lights[field]));
};

export { maskDarkRoomLights };
