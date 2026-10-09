/* @layer shared-types @kind types */
import type { FunctionMapping } from '../controls/functions/functions.type';
import type { ModernScheme } from '@rotp/game-data';
import type { HapticSettings } from './haptic-settings.type';

interface ControlSettings {
  activeInputProfileId: string | null;
  mapOnSelect: boolean;
  modernScheme: ModernScheme;
  functionMappings?: FunctionMapping[];
  enhancedSaveSlotShortcut: boolean;
  saveHoldDuration: number;
  haptics: HapticSettings;
  hapticsEnabled: boolean;
  cheatsEnabled: boolean;
  vanillaSafe: boolean;
}

export type { ControlSettings };
