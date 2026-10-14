/* @layer renderer-hud @kind logic */
import type { GameUIState } from '@rotp/game-data';
import type { LocationTracker } from './location-tracker.type';

const hasMapMoved = (tracker: LocationTracker, map: GameUIState['map'], prevMap: GameUIState['map']): boolean => {
  if (map.roomIndex === prevMap.roomIndex && map.overworldScreenIndex === prevMap.overworldScreenIndex) return false;
  if (map.roomIndex === tracker.prevRoom && map.overworldScreenIndex === tracker.prevOwScreen) return false;
  tracker.prevRoom = map.roomIndex;
  tracker.prevOwScreen = map.overworldScreenIndex;
  return true;
};

export { hasMapMoved };
