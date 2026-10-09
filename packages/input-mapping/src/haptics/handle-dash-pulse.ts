/* @layer shared-input @kind logic */
import { DASH_PULSE_INTERVAL_MS } from './haptics.constants';
import { firePattern } from './fire-pattern';
import { hapticState } from './haptic-state';

const handleDashPulse = (): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !settings.dashVibration || !hapticState.vibrateFn) return;

  const now = performance.now();
  if (now - hapticState.lastDashPulseTime < DASH_PULSE_INTERVAL_MS) return;
  hapticState.lastDashPulseTime = now;
  firePattern('dashStep');
};

export { handleDashPulse };
