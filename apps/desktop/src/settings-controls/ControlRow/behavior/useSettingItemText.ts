/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { useBrock, useSettings, useText } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { findSettingItem } from './find-setting-item';
import type { SettingItemText } from '../ControlRow.type';

const useSettingItemText = (key: string): SettingItemText => {
  const { tabs } = useBrock();
  const { settings } = useSettings<AppSettings>();
  const text = useText();
  return useMemo(() => {
    const item = findSettingItem(tabs, settings, key);
    if (item === null) return { title: key };
    return {
      title: text(item.label),
      hint: item.hint === undefined ? undefined : text(item.hint),
      description: item.description === undefined ? undefined : text(item.description),
    };
  }, [tabs, settings, key, text]);
};

export { useSettingItemText };
