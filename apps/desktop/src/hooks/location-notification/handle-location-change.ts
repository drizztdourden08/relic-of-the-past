/* @layer renderer-hud @kind logic */
import { resolveCurrentScreen } from '@rotp/game-data';
import type { GameUIStore } from '../../stores/game-ui-store/game-ui-store.type';
import { useLocationNotificationStore } from '../../stores/location-notification-store';
import { announceLocation } from './announce-location';
import { hasMapMoved } from './has-map-moved';
import type { LocationTracker } from './location-tracker.type';

const handleLocationChange = (tracker: LocationTracker, state: GameUIStore, prevState: GameUIStore): void => {
  const { map } = state;
  if (!hasMapMoved(tracker, map, prevState.map)) return;

  const { showScreen, showTransition } = useLocationNotificationStore.getState();
  if (!showScreen && !showTransition) return;

  const detected = resolveCurrentScreen({
    isIndoors: map.isIndoors,
    palaceIndex: map.palaceIndex,
    roomIndex: map.roomIndex,
    overworldScreenIndex: map.overworldScreenIndex,
    whichEntrance: map.whichEntrance,
  });
  if (!detected) return;

  announceLocation(tracker, detected);
};

export { handleLocationChange };
