/* @layer renderer-components @kind logic */
import { codeInfoFor } from '@shared/game/language';
import { MESSAGE_SETTING_NAMES } from '../../sub-components/message-settings';
import { paramValuesFor } from '../../sub-components/code-params';
import { AUTO_OPTION } from './settings-fields.constants';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { SettingField } from './settings-fields.type';

const settingFieldsFor = (cfg: LanguageConfig): SettingField[] => (
  MESSAGE_SETTING_NAMES.map((name) => {
    const info = codeInfoFor(name);
    const values = paramValuesFor(name, cfg) ?? [];
    return {
      name,
      label: info?.label ?? name,
      description: info?.description ?? '',
      options: [
        AUTO_OPTION,
        ...values.map((value) => ({ value: String(value), label: String(value) })),
      ],
    };
  })
);

export { settingFieldsFor };
