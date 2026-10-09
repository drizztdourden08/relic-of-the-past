/* @layer shared-game @kind logic */
import { LIGHTS_BEHIND_WORLD_SHUFFLE, WORLD_SHUFFLE_REASON } from './dark-room-forced.constants';
import type { DarkRoomLightField } from '@rotp/game-core';

const forcedDarkRoomLightReasons = (
  includeWorldItems: boolean,
): ReadonlyMap<DarkRoomLightField, string> => new Map(
  includeWorldItems ? [] : LIGHTS_BEHIND_WORLD_SHUFFLE.map((field) => [field, WORLD_SHUFFLE_REASON]),
);

export { forcedDarkRoomLightReasons };
