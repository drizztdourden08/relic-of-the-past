/* @layer renderer-hud @kind logic */
import type { ScreenRecord } from '@rotp/game-data';

const isRenamedEntrance = (prev: ScreenRecord | null, detected: ScreenRecord): boolean =>
  prev !== null && prev.locationId === detected.locationId && prev.name !== detected.name;

export { isRenamedEntrance };
