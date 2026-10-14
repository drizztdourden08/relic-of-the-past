/* @layer renderer-hud @kind logic */
import { useLocationNotificationStore } from '../../stores/location-notification-store';
import { TRANSITION_DISMISS_MS } from '../hooks.constants';
import type { LocationTracker } from './location-tracker.type';

const showTransitionName = (tracker: LocationTracker, entrance: string): void => {
  useLocationNotificationStore.getState().setTransition(entrance);

  if (tracker.transitionTimer) clearTimeout(tracker.transitionTimer);
  tracker.transitionTimer = setTimeout(() => {
    useLocationNotificationStore.getState().clearTransition();
  }, TRANSITION_DISMISS_MS);
};

export { showTransitionName };
