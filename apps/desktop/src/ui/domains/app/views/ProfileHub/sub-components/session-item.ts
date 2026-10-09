/* @layer renderer-components @kind logic */
import type { SettingItem } from '../../../compounds/SettingsLayout';
import { SESSION_ITEMS } from './online-notice-rows.constants';
import type { SessionSwitchKey } from './online-settings-sections.type';

const sessionItem = (key: SessionSwitchKey): SettingItem => {
  const { label, description, keywords } = SESSION_ITEMS[key];
  return { key, label, description, keywords };
};

export { sessionItem };
