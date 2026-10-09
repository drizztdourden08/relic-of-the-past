/* @layer renderer-components @kind types */
import type { SelectOption } from '@drizztdourden08/tessera/primitives';

type SettingField = {
  name: string;
  label: string;
  description: string;
  options: SelectOption[];
};

export type { SettingField };
