/* @layer renderer-components @kind logic */
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import {
  DARK_ROOM_LIGHT_FIELDS, DARK_ROOM_LIGHT_ITEMS,
} from '@shared/randomizer/world/dark-rooms/dark-room-lights.data';
import { getItem } from '@shared/game/data';
import type {
  DarkRoomLightField, DarkRoomLights,
} from '@shared/randomizer/world/dark-rooms/dark-room.type';
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
