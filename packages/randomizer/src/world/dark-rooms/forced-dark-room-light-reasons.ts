/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { getItem } from '@rotp/game-data';
import { DARK_ROOM_LIGHT_ITEMS } from './dark-room-lights.constants';
import { LIGHTS_BEHIND_WORLD_SHUFFLE } from './dark-room-forced.constants';
import type { DarkRoomLightField } from '@rotp/game-core';

const forcedDarkRoomLightReasons = (
  includeWorldItems: boolean,
): ReadonlyMap<DarkRoomLightField, Message> => new Map(
  includeWorldItems ? [] : LIGHTS_BEHIND_WORLD_SHUFFLE.map((field) => [
    field,
    msg('randomizer:dark-room.world-shuffle-reason', { name: getItem(DARK_ROOM_LIGHT_ITEMS[field]).name }),
  ]),
);

export { forcedDarkRoomLightReasons };
