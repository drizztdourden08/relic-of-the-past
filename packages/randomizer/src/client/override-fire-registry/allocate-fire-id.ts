/* @layer bridge-wasm @kind logic */
import { checkIdOfLocation } from '../../world/location-record';
import { fireRegistryState } from './fire-registry-state';
import type { LocationKey } from '../../world/location-key';

const allocateFireId = (location: LocationKey): number => {
  const fireId = fireRegistryState.nextFireId;
  fireRegistryState.nextFireId += 1;
  fireRegistryState.locationByFireId.set(fireId, location);
  const checkId = checkIdOfLocation(location);
  if (checkId !== undefined) fireRegistryState.armedCheckIds.add(checkId);
  return fireId;
};

export { allocateFireId };
