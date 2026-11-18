/* @layer renderer-components @kind logic */
import { codeInfoFor } from '@rotp/languages';
import { MESSAGE_SETTING_NAMES } from '../../sub-components/message-settings';
import { paramValuesFor } from '../../sub-components/code-params';
import { autoOptionOf } from './settings-fields.constants';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { SettingField } from './settings-fields.type';

const settingFieldsFor = (t: I18n['t'], cfg: LanguageConfig): SettingField[] => (
  MESSAGE_SETTING_NAMES.map((name) => {
    const info = codeInfoFor(name);
    const values = paramValuesFor(name, cfg) ?? [];
    return {
      name,
      label: info?.label ?? name,
      description: info?.description ?? '',
      options: [
        autoOptionOf(t),
        ...values.map((value) => ({ value: String(value), label: String(value) })),
      ],
    };
  })
);

export { settingFieldsFor };
