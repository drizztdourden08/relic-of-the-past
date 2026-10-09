/* @layer renderer-components @kind logic */
import { get } from '@shared/game/data';
import type { CheckRecord } from '@shared/game/data';
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { virtualCheckIdOf } from '@app/lib/game/randomizer-client/virtual-locations';
import { getSessionState, virtualChecksOf } from '@app/lib/game/randomizer-client';

const recordOfLocation = (location: LocationKey): CheckRecord | undefined => {
  const checkId = checkIdOfLocation(location);
  if (checkId !== undefined) return get('check', checkId);
  const { placement } = getSessionState();
  if (placement === null) return undefined;
  const id = virtualCheckIdOf(location);
  return virtualChecksOf(placement).find((record) => record.id === id);
};

export { recordOfLocation };
