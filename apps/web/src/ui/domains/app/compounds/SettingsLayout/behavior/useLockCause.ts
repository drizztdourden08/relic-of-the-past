/* @layer renderer-components @kind hook */
import { useCallback, useContext } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { FEATURES_BY_ID } from '@shared/features/feature-registry';
import { isVanillaSafeLockedSetting } from '@shared/features/vanilla-safe-settings';
import { RandomizerLockContext } from './randomizer-lock-context';
import type { SettingLockCause } from '../SettingsLayout.type';

const useLockCause = (settings: GameSettings) => {
  const randomizerFrozenKeys = useContext(RandomizerLockContext);

  const lockCauseOf = useCallback((key: string): SettingLockCause | null => {
    if (randomizerFrozenKeys.includes(key)) return 'randomizer';
    const vanillaSafeLocked = settings.vanillaSafe === true &&
      (FEATURES_BY_ID[key]?.affectsVanillaParity === true || isVanillaSafeLockedSetting(key));
    return vanillaSafeLocked ? 'vanillaSafe' : null;
  }, [randomizerFrozenKeys, settings.vanillaSafe]);

  const isLockedKey = useCallback((key: string) => lockCauseOf(key) !== null, [lockCauseOf]);

  return { lockCauseOf, isLockedKey };
};

export { useLockCause };
