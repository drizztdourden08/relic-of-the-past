/* @layer renderer-appshell @kind types */
import type { GameSettings } from '@shared/types/settings';

interface WidgetGate {
  readsGameData?: boolean;
  requiresSetting?: keyof GameSettings;
}

interface WidgetDisabledState {
  message: string;
  settingId: string;
}

export type { WidgetDisabledState, WidgetGate };
