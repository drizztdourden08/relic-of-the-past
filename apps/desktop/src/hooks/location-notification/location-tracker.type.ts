/* @layer renderer-hud @kind types */
import type { ScreenRecord } from '@rotp/game-data';

type LocationTracker = {
  prevDetected: ScreenRecord | null;
  prevRoom: number;
  prevOwScreen: number;
  screenTimer: ReturnType<typeof setTimeout> | null;
  transitionTimer: ReturnType<typeof setTimeout> | null;
};

export type { LocationTracker };
