/* @layer renderer-hud @kind logic */
import type { LocationTracker } from './location-tracker.type';

const createLocationTracker = (): LocationTracker => ({
  prevDetected: null,
  prevRoom: -1,
  prevOwScreen: -1,
  screenTimer: null,
  transitionTimer: null,
});

export { createLocationTracker };
