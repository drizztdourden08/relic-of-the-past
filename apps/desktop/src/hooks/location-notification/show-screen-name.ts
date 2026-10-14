/* @layer renderer-hud @kind logic */
import type { ScreenRecord } from '@rotp/game-data';
import { useLocationNotificationStore } from '../../stores/location-notification-store';
import { SCREEN_DISMISS_MS } from '../hooks.constants';
import type { LocationTracker } from './location-tracker.type';

const showScreenName = (tracker: LocationTracker, detected: ScreenRecord): void => {
  useLocationNotificationStore.getState().setScreen(detected);

  if (tracker.screenTimer) clearTimeout(tracker.screenTimer);
  tracker.screenTimer = setTimeout(() => {
    useLocationNotificationStore.getState().clearScreen();
  }, SCREEN_DISMISS_MS);
};

export { showScreenName };
