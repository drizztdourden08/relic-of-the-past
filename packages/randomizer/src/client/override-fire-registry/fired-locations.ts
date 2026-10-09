/* @layer bridge-wasm @kind logic */
import { fireRegistryState } from './fire-registry-state';
import type { LocationKey } from '../../world/location-key';

const firedLocations = (): ReadonlySet<LocationKey> => fireRegistryState.firedLocationKeys;

export { firedLocations };
