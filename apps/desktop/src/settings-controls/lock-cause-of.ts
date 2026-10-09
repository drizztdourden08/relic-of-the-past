/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { SettingLockCause } from '@drizztdourden08/brock-react';
import { FEATURES_BY_ID, isVanillaSafeLockedSetting } from '@rotp/features';
import type { GameSettings } from '@rotp/features';

const frozenKeys = (): string[] => Object.keys(useProfilesStore.getState().active?.randomizer?.frozenSettings ?? {});

const lockCauseOf = (key: string, settings: GameSettings): SettingLockCause | null => {
  if (frozenKeys().includes(key)) return 'randomizer';
  const parity = FEATURES_BY_ID[key]?.affectsVanillaParity === true || isVanillaSafeLockedSetting(key);
  return settings.vanillaSafe === true && parity ? 'vanillaSafe' : null;
};

export { lockCauseOf };
