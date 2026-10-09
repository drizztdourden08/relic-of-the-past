/* @layer shared-input @kind logic */
import { firePattern } from './fire-pattern';
import { hapticState } from './haptic-state';

const handleDeath = (): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !settings.damageTaken || !hapticState.vibrateFn) return;
  firePattern('death');
};

export { handleDeath };
