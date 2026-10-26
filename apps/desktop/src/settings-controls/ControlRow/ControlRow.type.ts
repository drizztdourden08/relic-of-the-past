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
  hint?: string;
  description?: string;
}

interface SettingItemText {
  title: string;
  hint?: string;
  description?: string;
}

export type { ControlRowLook, ControlRowProps, SettingItemText };
