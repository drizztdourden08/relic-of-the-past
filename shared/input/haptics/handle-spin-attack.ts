/* @layer shared-input @kind logic */
import { firePattern } from './fire-pattern';
import { hapticState } from './haptic-state';

const handleSpinAttack = (): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !settings.swordSwing || !hapticState.vibrateFn) return;
  firePattern('spinAttackRelease');
};

export { handleSpinAttack };
