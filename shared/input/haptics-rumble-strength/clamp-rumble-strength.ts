/* @layer shared-input @kind logic */
import { DEFAULT_RUMBLE_STRENGTH, MAX_RUMBLE_STRENGTH, MIN_RUMBLE_STRENGTH } from './haptics-rumble-strength.constants';

const clampRumbleStrength = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_RUMBLE_STRENGTH;
  return Math.min(MAX_RUMBLE_STRENGTH, Math.max(MIN_RUMBLE_STRENGTH, value));
};

export { clampRumbleStrength };
