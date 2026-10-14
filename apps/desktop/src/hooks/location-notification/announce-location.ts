/* @layer renderer-hud @kind logic */
import type { ScreenRecord } from '@rotp/game-data';
import { useLocationNotificationStore } from '../../stores/location-notification-store';
import { isNewLocation } from './is-new-location';
import { isRenamedEntrance } from './is-renamed-entrance';
import type { LocationTracker } from './location-tracker.type';
import { showScreenName } from './show-screen-name';
import { showTransitionName } from './show-transition-name';

const announceLocation = (tracker: LocationTracker, detected: ScreenRecord): void => {
  const prev = tracker.prevDetected;
  tracker.prevDetected = detected;

  if (prev?.id === detected.id) return;

  const { showScreen, showTransition } = useLocationNotificationStore.getState();
  if (showScreen && isNewLocation(prev, detected)) showScreenName(tracker, detected);
  if (showTransition && isRenamedEntrance(prev, detected)) showTransitionName(tracker, detected.name);
};

export { announceLocation };
