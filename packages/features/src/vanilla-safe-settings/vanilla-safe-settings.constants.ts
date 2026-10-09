/* @layer shared-features @kind constants */
import { VANILLA_SAFE_LOCKED_SETTINGS } from './vanilla-safe-settings.data';

const HAPTICS_KEY_PREFIX = 'haptics';

const LOCKED_SETTING_KEYS: ReadonlySet<string> = new Set(VANILLA_SAFE_LOCKED_SETTINGS);

export { HAPTICS_KEY_PREFIX, LOCKED_SETTING_KEYS };
