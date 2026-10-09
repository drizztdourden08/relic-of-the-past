/* @layer renderer-components @kind logic */
import { getItemSprite } from '@rotp/game-data';
import { DARK_ROOM_LIGHT_FIELDS, DARK_ROOM_LIGHT_ITEMS } from '@rotp/randomizer';
import { getItem } from '@rotp/game-data';
import type { DarkRoomLightField, DarkRoomLights } from '@rotp/game-core';
import { NO_FORCED } from './dark-room-light-tiles.constants';
import type { DarkRoomLightTileModel } from './dark-room-light-tiles.type';

const darkRoomLightTilesOf = (
  lights: DarkRoomLights, spritesAvailable: boolean,
  forced: ReadonlyMap<DarkRoomLightField, string> = NO_FORCED,
): DarkRoomLightTileModel[] => DARK_ROOM_LIGHT_FIELDS.map((field) => {
  const itemId = DARK_ROOM_LIGHT_ITEMS[field];
  const reason = forced.get(field);
  return {
    field,
    name: getItem(itemId).name,
    sprite: spritesAvailable ? getItemSprite(itemId) : undefined,
    checked: reason === undefined && lights[field],
    ...(reason === undefined ? {} : { reason }),
  };
});

export { darkRoomLightTilesOf };
export type { DarkRoomLightTileModel };
