/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { useBrock, useSettings } from '@drizztdourden08/brock-react';
import type { SettingItem } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { findSettingItem } from './find-setting-item';

const useSettingItem = (key: string): SettingItem | null => {
  const { tabs } = useBrock();
  const { settings } = useSettings<AppSettings>();
  return useMemo(() => findSettingItem(tabs, settings, key), [tabs, settings, key]);
};

export { useSettingItem };
