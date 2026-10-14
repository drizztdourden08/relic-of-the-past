/* @layer renderer-appshell @kind types */
import type { GameSettings } from '@rotp/features';

interface WidgetGate {
  readsGameData?: boolean;
  requiresSetting?: keyof GameSettings;
}

export type { WidgetGate };
