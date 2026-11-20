/* @layer renderer-app @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { KEY_LABEL_KEYS } from './key-name.constants';

const keyName = (raw: string, t: I18n['t']): string => {
  const key = KEY_LABEL_KEYS[raw];
  return key ? t(key) : raw;
};

export { keyName };
