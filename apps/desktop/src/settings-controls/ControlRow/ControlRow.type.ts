/* @layer renderer-app @kind types */
import type { SettingsInput } from '@drizztdourden08/tessera/composites';

interface ControlRowLook {
  input: SettingsInput;
  disabled?: boolean;
  changed?: boolean;
  onReset?: () => void;
}

interface ControlRowProps extends ControlRowLook {
  id: string;
  title: string;
  hint: string;
  description?: string;
}

interface KeyedControlRowProps extends ControlRowLook {
  settingKey: string;
}

interface SettingItemText {
  title: string;
  hint: string;
  description?: string;
}

export type { ControlRowProps, KeyedControlRowProps, SettingItemText };
