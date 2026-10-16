/* @layer renderer-components @kind types */
type SettingFormat = (value: unknown) => string;

type SettingsSection = { title: string; keys: Array<{ key: string; label: string; format?: SettingFormat }> };

export type { SettingFormat, SettingsSection };
