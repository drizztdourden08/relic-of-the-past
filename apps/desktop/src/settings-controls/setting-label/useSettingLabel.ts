/* @layer renderer-app @kind hook */
import { useSettingItem } from './useSettingItem';

const useSettingLabel = (key: string): string => useSettingItem(key)?.label ?? key;

export { useSettingLabel };
