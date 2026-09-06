/* @layer renderer-components @kind logic */
/**
 * The four lights as tiles: the item each one stands for, its art from the
 * extracted set, and whether this setting accepts it. Art comes the same way
 * the pool listing gets it — the item's own record through its standard name
 * — so a light shows the very sprite the player will see in their inventory.
 *
 * While the set is not extracted yet no tile carries a sprite at all: the row
 * draws placeholders rather than asking for files that are not on disk, and
 * fills in on its own once the background extraction lands.
 *
 * A tile a sibling setting has masked (dark-rooms/dark-room-forced.ts) shows
 * OFF with the reason on it whatever the setting stores: the seed is built
 * with it off, and a tile that ticks while the seed ignores it is the thing
 * worth avoiding. The stored answer is untouched here, so lifting the mask
 * hands the tick straight back.
 */
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import {
  DARK_ROOM_LIGHT_FIELDS, DARK_ROOM_LIGHT_ITEMS,
} from '@shared/randomizer/ap-world/dark-rooms/dark-room-lights.data';
import { itemIdByStandardName } from '@app/lib/game/randomizer-client';
import type {
  DarkRoomLightField, DarkRoomLights,
} from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';

interface DarkRoomLightTileModel {
  field: DarkRoomLightField;
  /** The item's own name — the tile's accessible name and its tooltip. */
  name: string;
  /** URL of its extracted sprite; absent draws the neutral placeholder. */
  sprite?: string;
  checked: boolean;
  /** Why a sibling setting holds this tile off; absent leaves it to the player. */
  reason?: string;
}

const NO_FORCED: ReadonlyMap<DarkRoomLightField, string> = new Map();

const spriteOf = (name: string): string | undefined => {
  const itemId = itemIdByStandardName(name);
  return itemId === undefined ? undefined : getItemSprite(itemId);
};

const darkRoomLightTilesOf = (
  lights: DarkRoomLights, spritesAvailable: boolean,
  forced: ReadonlyMap<DarkRoomLightField, string> = NO_FORCED,
): DarkRoomLightTileModel[] => DARK_ROOM_LIGHT_FIELDS.map((field) => {
  const name = DARK_ROOM_LIGHT_ITEMS[field];
  const reason = forced.get(field);
  return {
    field,
    name,
    sprite: spritesAvailable ? spriteOf(name) : undefined,
    checked: reason === undefined && lights[field],
    ...(reason === undefined ? {} : { reason }),
  };
});

export { darkRoomLightTilesOf };
export type { DarkRoomLightTileModel };
