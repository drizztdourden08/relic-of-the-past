/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { SETTING_ENUM_KEYS } from './setting-enum-keys.constants';

const capitalizeSetting = (v: unknown, fallback: string, t: I18n['t']): string => {
  const s = String(v ?? fallback);
  const key = SETTING_ENUM_KEYS[s];
  return key === undefined ? s.charAt(0).toUpperCase() + s.slice(1) : t(key);
};

export { capitalizeSetting };
