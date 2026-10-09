/* @layer shared-input @kind logic */
import { setCachedRumbleStrength } from './set-cached-rumble-strength';

const loadRumbleStrengthCache = (store: Record<string, number>): void => {
  for (const [deviceKey, value] of Object.entries(store)) setCachedRumbleStrength(deviceKey, value);
};

export { loadRumbleStrengthCache };
