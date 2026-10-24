/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { useBrock, useSettings } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { findSettingItem } from './find-setting-item';
import type { SettingItemText } from '../ControlRow.type';

const useSettingItemText = (key: string): SettingItemText => {
  const { tabs } = useBrock();
  const { settings } = useSettings<AppSettings>();
  return useMemo(() => {
    const item = findSettingItem(tabs, settings, key);
    if (item === null) return { title: key };
    return { title: item.label, hint: item.hint, description: item.description };
  }, [tabs, settings, key]);
};

export { useSettingItemText };
