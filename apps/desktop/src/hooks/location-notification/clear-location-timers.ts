/* @layer renderer-hud @kind logic */
import type { LocationTracker } from './location-tracker.type';

const clearLocationTimers = (tracker: LocationTracker): void => {
  if (tracker.screenTimer) clearTimeout(tracker.screenTimer);
  if (tracker.transitionTimer) clearTimeout(tracker.transitionTimer);
};

export { clearLocationTimers };
