/* @layer renderer-components @kind types */
import type { SelectOption } from '@ds/primitives';

type SettingField = {
  name: string;
  label: string;
  description: string;
  options: SelectOption[];
};

export type { SettingField };
