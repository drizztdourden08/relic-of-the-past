/* @layer shared-input @kind logic */
import { DEFAULT_RUMBLE_STRENGTH } from './haptics-rumble-strength.constants';
import { rumbleStrengthCache } from './rumble-strength-cache';

const getCachedRumbleStrength = (deviceKey: string): number => {
  return rumbleStrengthCache.get(deviceKey) ?? DEFAULT_RUMBLE_STRENGTH;
};

export { getCachedRumbleStrength };
