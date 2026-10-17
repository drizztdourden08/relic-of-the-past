/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { SettingLockCause } from '@drizztdourden08/brock-react';
import { FEATURES_BY_ID, isVanillaSafeLockedSetting } from '@rotp/features';
import type { GameSettings } from '@rotp/features';
import { developerLockCause } from './contributing/developer-lock-cause';
import { hostLockCause } from './host-lock-cause';

const frozenKeys = (): string[] => Object.keys(useProfilesStore.getState().active?.randomizer?.frozenSettings ?? {});

const lockCauseOf = (key: string, settings: GameSettings): SettingLockCause | null => {
  const host = hostLockCause(key);
  if (host !== null) return host;
  const developer = developerLockCause(key, settings);
  if (developer !== null) return developer;
  if (frozenKeys().includes(key)) return 'randomizer';
  const parity = FEATURES_BY_ID[key]?.affectsVanillaParity === true || isVanillaSafeLockedSetting(key);
  return settings.vanillaSafe === true && parity ? 'vanillaSafe' : null;
};

export { lockCauseOf };
