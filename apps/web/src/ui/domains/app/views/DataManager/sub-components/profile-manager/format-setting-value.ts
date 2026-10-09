/* @layer renderer-components @kind logic */
import type { SettingFormat } from './settings-sections.type';

const formatSettingValue = (value: unknown, format?: SettingFormat): string => {
  if (format) return format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value == null) return '-';
  return String(value);
};

export { formatSettingValue };
