/* @layer renderer-lib @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';

/**
 * Whether the crossing sits on a real tile. The exit table names a destination
 * without saying where its door is, so that crossing carries a placeholder tile
 * and belongs in a list but on no map.
 */
const isPlaced = (crossing: ScreenCrossing): boolean => crossing.placed;

/**
 * Whether the crossing is a drop's arrival rather than its mouth. Indoors a hole
 * is the tile the player lands on and gets its own section; outdoors it is the
 * pit itself and belongs with the other ways off the screen.
 */
const isLanding = (crossing: ScreenCrossing, isIndoors: boolean): boolean =>
  isIndoors && crossing.origin === 'fall-hole';

/** Everything the entrances list shows, reachable or not. */
const listedCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) => !isLanding(crossing, isIndoors));

/** The arrival tiles of the drops into this room. */
const landingCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) => isLanding(crossing, isIndoors));

/** The crossings a map marks: on a tile, usable right now, and not a landing. */
const markerCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) =>
    crossing.available && isPlaced(crossing) && !isLanding(crossing, isIndoors));

export { isPlaced, isLanding, listedCrossings, landingCrossings, markerCrossings };
