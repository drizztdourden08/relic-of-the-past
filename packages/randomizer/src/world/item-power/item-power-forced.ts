/* @layer shared-game @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { FORCED_ON_REASON, FORCED_WITHOUT_BEAM, FORCED_WITHOUT_BLADE } from './item-power-forced.constants';

const forcedItemPowerReasons = (
  swordReachable: boolean, beamSwordReachable: boolean,
): ReadonlyMap<string, Message> => {
  const forced = new Map<string, Message>();
  if (!swordReachable) for (const key of FORCED_WITHOUT_BLADE) forced.set(key, FORCED_ON_REASON);
  if (!beamSwordReachable) for (const key of FORCED_WITHOUT_BEAM) forced.set(key, FORCED_ON_REASON);
  return forced;
};

export { forcedItemPowerReasons };
