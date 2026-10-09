/* @layer renderer-widgets @kind logic */
import type { ScreenRecord } from '@rotp/game-data';
import { getScreenLookup } from '@rotp/game-data';

const overworldScreen = (index: number): ScreenRecord | undefined =>
  getScreenLookup().byOverworldScreen.get(index);

export { overworldScreen };
