/* @layer renderer-hud @kind logic */
import type { ScreenRecord } from '@rotp/game-data';

const isNewLocation = (prev: ScreenRecord | null, detected: ScreenRecord): boolean =>
  prev?.locationId !== detected.locationId;

export { isNewLocation };
