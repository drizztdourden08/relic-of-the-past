/* @layer renderer-components @kind hook */
/**
 * Why a setting's control is locked, if it is. Two causes: a profile with
 * randomizer config pins the keys in its frozen set for the profile's whole
 * life, and Vanilla Safe locks every setting that stops working under it. That
 * second set comes from two places: the registry flag covers gate-word
 * features, and vanilla-safe-settings.ts covers the rest (cheats, MSU, the
 * custom sprite, the overlay HUD, the two hand-gated renderer effects), which
 * Vanilla Safe forces off in the INI or the PPU flags without any FeatureDef.
 */
import { useCallback, useContext } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { FEATURES_BY_ID } from '@shared/features/feature-registry';
import { isVanillaSafeLockedSetting } from '@shared/features/vanilla-safe-settings';
import { RandomizerLockContext } from '../randomizer-lock-context';
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
