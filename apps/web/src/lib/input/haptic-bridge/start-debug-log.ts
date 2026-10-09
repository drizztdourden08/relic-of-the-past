/* @layer renderer-lib @kind logic */
import { DEBUG_LOG_INTERVAL_MS } from './haptic-bridge.constants';
import { hapticState } from './haptic-state';

const startDebugLog = (): void => {
  if (hapticState.debugLogTimer) return;
  hapticState.debugLogTimer = setInterval(() => {
    const counts = hapticState.counts;
    if (counts.coreHooks === 0 && counts.events === 0) return;
    console.log(`[Haptic] C-hooks=${counts.coreHooks} service=${counts.events} dispatched=${counts.dispatched} merged=${counts.merged}`);
    counts.coreHooks = 0;
    counts.events = 0;
    counts.dispatched = 0;
    counts.merged = 0;
  }, DEBUG_LOG_INTERVAL_MS);
};

export { startDebugLog };
