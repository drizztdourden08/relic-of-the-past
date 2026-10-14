/* @layer shared-game @kind logic */
import { spotOfFamily } from '../../capacity/capacity-spots';
import type { LocationKey } from '../../location-key';

const isMeterLocked = (lockedScope: ReadonlySet<LocationKey>): boolean => {
  const meterSpot = spotOfFamily('meter');
  return meterSpot !== undefined && lockedScope.has(meterSpot);
};

export { isMeterLocked };
