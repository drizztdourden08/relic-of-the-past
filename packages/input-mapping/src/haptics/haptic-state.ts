/* @layer shared-input @kind logic */
import type { HapticState } from './haptics.type';

const hapticState: HapticState = {
  settings: {
    enabled: true,
    intensity: 70,
    swordSwing: true,
    swordHitEnemy: true,
    swordClink: true,
    damageTaken: true,
    itemUse: true,
    dashVibration: true,
    environmentalEffects: true,
  },
  vibrateFn: null,
  lastDashPulseTime: 0,
};

export { hapticState };
