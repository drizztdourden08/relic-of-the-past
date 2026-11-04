/* @layer renderer-app @kind logic */
import { LOCK_CAUSE_ORDER } from '@drizztdourden08/brock-react';
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import { FEATURES_BY_ID, isVanillaSafeLockedSetting } from '@rotp/features';
import type { GameSettings } from '@rotp/features';

const vanillaSafeLockProvider: LockCauseProvider<GameSettings> = {
  id: 'vanillaSafe',
  order: LOCK_CAUSE_ORDER.parity,
  causeOf: (key, settings) => {
    const parity = FEATURES_BY_ID[key]?.affectsVanillaParity === true || isVanillaSafeLockedSetting(key);
    return settings.vanillaSafe === true && parity ? 'vanillaSafe' : null;
  },
};

export { vanillaSafeLockProvider };
