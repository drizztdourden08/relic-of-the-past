/* @layer renderer-widgets @kind logic */
import { getScreenLookup } from '@rotp/game-data';
import { screenName } from '@app/game/record-text';

const getScreenDisplayName = (screenIndex: number): string => {
  const screen = getScreenLookup().byOverworldScreen.get(screenIndex);
  return screen ? screenName(screen) : `0x${screenIndex.toString(16).toUpperCase()}`;
};

export { getScreenDisplayName };
