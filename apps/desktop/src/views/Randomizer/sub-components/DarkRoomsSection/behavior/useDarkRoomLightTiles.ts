/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useSpriteAvailability } from '@app/hooks/useSpriteAvailability';
import { useSpriteRevision } from '@app/hooks/useSpriteRevision';
import { darkRoomLightTilesOf } from './dark-room-light-tiles';
import type { DarkRoomLightTileModel } from './dark-room-light-tiles.type';
import type { DarkRoomLightField, DarkRoomLights } from '@rotp/game-core';

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
