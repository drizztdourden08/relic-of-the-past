/* @layer renderer-components @kind hook */
/**
 * The light tiles of a setting, rebuilt when the extracted sprite set behind
 * them moves. The revision is a dependency although nothing reads it: a set
 * rewritten in place is served under new URLs, so the memo has to be recomputed
 * or the tiles keep the sources that failed while the folder was being written.
 *
 * The flag is read for no ROM in particular (as recorded) instead of asked
 * for one: the app points the set at a ROM from startup on (spriteRomOf, the
 * active profile's or a ready one), and the creation form re-points it at the
 * ROM the person picks, so asking again here would only re-run that
 * activation. Until it lands the tiles carry no art and draw placeholders, and
 * the render that follows picks the set up.
 */
import { useMemo } from 'react';
import { useSpriteAvailability } from '@app/lib/sprites/useSpriteAvailability';
import { useSpriteRevision } from '@app/lib/sprites/useSpriteRevision';
import { darkRoomLightTilesOf } from './dark-room-light-tiles';
import type { DarkRoomLightTileModel } from './dark-room-light-tiles';
import type {
  DarkRoomLightField, DarkRoomLights,
} from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';

const useDarkRoomLightTiles = (
  lights: DarkRoomLights, forced?: ReadonlyMap<DarkRoomLightField, string>,
): readonly DarkRoomLightTileModel[] => {
  const spritesAvailable = useSpriteAvailability(null);
  const revision = useSpriteRevision();

  return useMemo(
    () => darkRoomLightTilesOf(lights, spritesAvailable, forced),
    [lights, spritesAvailable, forced, revision],
  );
};

export { useDarkRoomLightTiles };
