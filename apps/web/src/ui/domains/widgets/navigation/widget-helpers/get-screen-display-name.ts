/* @layer renderer-widgets @kind logic */
import { getScreenLookup } from '@shared/game/logic/queries/detection';

const getScreenDisplayName = (screenIndex: number): string => {
  const screen = getScreenLookup().byOverworldScreen.get(screenIndex);
  return screen ? screen.name : `0x${screenIndex.toString(16).toUpperCase()}`;
};

export { getScreenDisplayName };
