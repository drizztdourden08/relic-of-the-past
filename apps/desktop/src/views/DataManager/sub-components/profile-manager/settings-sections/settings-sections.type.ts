/* @layer renderer-components @kind types */
import type { I18n, Message } from '@drizztdourden08/brock-core/i18n';
type SettingFormat = (value: unknown, t: I18n['t']) => string;

type SettingsSection = { title: Message; keys: Array<{ key: string; label: Message; format?: SettingFormat }> };

export type { SettingFormat, SettingsSection };
