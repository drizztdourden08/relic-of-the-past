/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { DEFAULT_SETTINGS } from '@app/settings.constants';
import type { AppSettings } from '@app/settings.type';
import { isSameValue } from './is-same-value';
import { readAtPath } from './read-at-path';
import type { SettingReset } from './setting-path.type';
import { withAtPath } from './with-at-path';

const useSettingReset = (key: string): SettingReset => {
  const { settings, patch } = useSettings<AppSettings>();
  const path = key.split('.');
  const original = readAtPath(DEFAULT_SETTINGS, path);
  const current = readAtPath(settings, path);
  const changed = original.known && current.known && !isSameValue(current.value, original.value);
  const reset = useCallback(() => {
    const [root] = key.split('.');
    if (root === undefined || !original.known) return;
    patch({ [root]: readAtPath(withAtPath(settings, key.split('.'), original.value), [root]).value });
  }, [patch, settings, original.known, original.value, key]);
  return { changed, reset };
};

export { useSettingReset };
