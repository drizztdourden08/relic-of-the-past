/* @layer renderer-widgets @kind logic */
import type { ScreenRecord } from '@shared/game/data';
import { getScreenLookup } from '@shared/game/logic/queries/detection';

const overworldScreen = (index: number): ScreenRecord | undefined =>
  getScreenLookup().byOverworldScreen.get(index);

export { overworldScreen };
