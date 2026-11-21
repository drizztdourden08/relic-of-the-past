/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SettingFormat } from './settings-sections.type';

const formatSettingValue = (value: unknown, t: I18n['t'], format?: SettingFormat): string => {
  if (format) return format(value, t);
  if (typeof value === 'boolean') return value ? t('data-manager:settings-sections.value.on') : t('data-manager:settings-sections.value.off');
  if (value == null) return t('data-manager:settings-sections.value.default');
  return String(value);
};

export { formatSettingValue };
