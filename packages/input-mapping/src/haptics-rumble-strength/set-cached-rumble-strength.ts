/* @layer shared-input @kind logic */
import { clampRumbleStrength } from './clamp-rumble-strength';
import { rumbleStrengthCache } from './rumble-strength-cache';

const setCachedRumbleStrength = (deviceKey: string, value: number): void => {
  rumbleStrengthCache.set(deviceKey, clampRumbleStrength(value));
};

export { setCachedRumbleStrength };
