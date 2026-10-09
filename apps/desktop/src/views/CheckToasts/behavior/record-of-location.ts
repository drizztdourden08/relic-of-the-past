/* @layer renderer-components @kind logic */
import { get } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import { checkIdOfLocation, virtualCheckIdOf } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import { getSessionState, virtualChecksOf } from '@app/game/randomizer-client';

const recordOfLocation = (location: LocationKey): CheckRecord | undefined => {
  const checkId = checkIdOfLocation(location);
  if (checkId !== undefined) return get('check', checkId);
  const { placement } = getSessionState();
  if (placement === null) return undefined;
  const id = virtualCheckIdOf(location);
  return virtualChecksOf(placement).find((record) => record.id === id);
};

export { recordOfLocation };
