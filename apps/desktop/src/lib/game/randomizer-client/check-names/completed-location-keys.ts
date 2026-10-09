/* @layer bridge-wasm @kind logic */
import { locationKeyOfCheck } from '@shared/randomizer/world/location-record';
import type { CheckId } from '@rotp/game-data';
import type { LocationKey } from '@shared/randomizer/world/location-key';

const completedLocationKeys = (
  completedChecks: Iterable<CheckId>, firedLocationKeys: Iterable<LocationKey> = [],
): Set<LocationKey> => {
  const keys = new Set<LocationKey>();
  for (const checkId of completedChecks) keys.add(locationKeyOfCheck(checkId));
  for (const key of firedLocationKeys) keys.add(key);
  return keys;
};

export { completedLocationKeys };
