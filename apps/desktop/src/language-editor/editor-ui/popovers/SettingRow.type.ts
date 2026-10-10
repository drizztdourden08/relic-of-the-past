/* @layer renderer-components @kind types */
import type { SettingField } from './settings-fields.type';

type SettingRowProps = {
  field: SettingField;
  value: string;
  onChange: (name: string, value: string) => void;
};

export type { SettingRowProps };
