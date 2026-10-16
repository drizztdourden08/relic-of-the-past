/* @layer renderer-components @kind logic */
import type { SettingFormat } from './settings-sections.type';

const formatSettingValue = (value: unknown, format?: SettingFormat): string => {
  if (format) return format(value);
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (value == null) return 'Default';
  return String(value);
};

export { formatSettingValue };
