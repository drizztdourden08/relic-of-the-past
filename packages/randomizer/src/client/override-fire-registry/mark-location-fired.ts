/* @layer bridge-wasm @kind logic */
import { fireRegistryState } from './fire-registry-state';
import type { LocationKey } from '../../world/location-key';

const markLocationFired = (location: LocationKey): void => {
  const { firedLocationKeys, firedListeners } = fireRegistryState;
  if (firedLocationKeys.has(location)) return;
  firedLocationKeys.add(location);
  for (const listener of firedListeners) listener(location);
};

export { markLocationFired };
