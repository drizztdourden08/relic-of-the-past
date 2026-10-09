/* @layer shared-input @kind barrel */
export { EnvironmentalEvent, HapticEventType, HapticItemId } from '../haptic-events';
export { getHapticIntensityScale } from './get-haptic-intensity-scale';
export { handleDashPulse } from './handle-dash-pulse';
export { handleDeath } from './handle-death';
export { handleEnvironmental } from './handle-environmental';
export { handleHapticEvent } from './handle-haptic-event';
export { handlePickup } from './handle-pickup';
export { handleSpinAttack } from './handle-spin-attack';
export { resetDashState } from './reset-dash-state';
export { setVibrateFunction } from './set-vibrate-function';
export { updateHapticSettings } from './update-haptic-settings';
export type { HapticEventTypeValue } from '../haptic-events';
export type { HapticSettings } from '../../types/settings';
