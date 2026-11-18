/* @layer shared-game @kind constants */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { ITEM_POWER_KEY } from './item-power.constants';

const FORCED_WITHOUT_BLADE: readonly string[] = [
  ITEM_POWER_KEY.swordlessMedallions,
  ITEM_POWER_KEY.pullableCurtains,
];

const FORCED_WITHOUT_BEAM: readonly string[] = [
  ITEM_POWER_KEY.hammerTablets,
  ITEM_POWER_KEY.hammerLastFight,
  ITEM_POWER_KEY.hammerTowerSeal,
];

const FORCED_ON_REASON: Message = { key: 'randomizer:item-power.forced-reason' };

export { FORCED_ON_REASON, FORCED_WITHOUT_BEAM, FORCED_WITHOUT_BLADE };
