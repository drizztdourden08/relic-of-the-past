/* @layer shared-input @kind logic */
import { hapticState } from './haptic-state';

const getHapticIntensityScale = (): number => hapticState.settings.intensity / 100;

export { getHapticIntensityScale };
