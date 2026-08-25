/* @layer renderer-components @kind logic */
/**
 * The message-wide display settings, as fields a picker can draw.
 *
 * Which three they are is stated by `message-settings.ts`; the label, the
 * description and the range of values all come back out of the control-code
 * catalog, narrowed to what this language's own encoder can bake. So nothing a
 * field offers can fail to compile, and no second catalog exists here.
 *
 * The extra "automatic" entry is a real choice rather than a blank: it means the
 * entry says nothing at all, and the engine's own default stands.
 */
import { codeInfoFor } from '@shared/game/language';
import { MESSAGE_SETTING_NAMES } from '../../sub-components/message-settings';
import { paramValuesFor } from '../../sub-components/code-params';
import type { SelectOption } from '@ds/primitives';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';

/** One setting as a labelled list of values. */
type SettingField = {
  /** Catalog code name, reported back so one handler serves every field. */
  name: string;
  label: string;
  description: string;
  options: SelectOption[];
};

/** "Say nothing", which takes the code out and lets the engine default apply. */
const AUTO_OPTION: SelectOption = { value: '', label: 'automatic' };

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
export type { SettingField };
