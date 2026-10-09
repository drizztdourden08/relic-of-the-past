/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useSpriteAvailability } from '@app/lib/sprites/useSpriteAvailability';
import { useSpriteRevision } from '@app/lib/sprites/useSpriteRevision';
import { darkRoomLightTilesOf } from './dark-room-light-tiles';
import type { DarkRoomLightTileModel } from './dark-room-light-tiles.type';
import type {
  DarkRoomLightField, DarkRoomLights,
} from '@shared/randomizer/world/dark-rooms/dark-room.type';

const useDarkRoomLightTiles = (
  lights: DarkRoomLights, forced?: ReadonlyMap<DarkRoomLightField, string>,
): readonly DarkRoomLightTileModel[] => {
  const spritesAvailable = useSpriteAvailability(null);
  const spriteRevision = useSpriteRevision();

  return useMemo(
    () => darkRoomLightTilesOf(lights, spritesAvailable, forced),
    [lights, spritesAvailable, forced, spriteRevision],
  );
};

export { useDarkRoomLightTiles };
