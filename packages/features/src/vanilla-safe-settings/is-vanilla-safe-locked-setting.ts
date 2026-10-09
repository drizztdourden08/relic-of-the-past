/* @layer shared-features @kind logic */
import { HAPTICS_KEY_PREFIX, LOCKED_SETTING_KEYS } from './vanilla-safe-settings.constants';

const isVanillaSafeLockedSetting = (key: string): boolean =>
  LOCKED_SETTING_KEYS.has(key) || key === HAPTICS_KEY_PREFIX || key.startsWith(`${HAPTICS_KEY_PREFIX}.`);

export { isVanillaSafeLockedSetting };
