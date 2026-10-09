/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { SyncedRateStatus } from '@shared/types/display';

interface SettingsViewProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  part?: 'display' | 'camera' | 'window';
}

interface ChoiceOption {
  value: string;
  label: string;
}

interface DisplayControlsParams {
  key: string;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  aspectOptions: ChoiceOption[];
  widePresets: ChoiceOption[];
  tallPresets?: ChoiceOption[];
  syncedRate: SyncedRateStatus;
  detectedHz: number | null;
}

export type { ChoiceOption, DisplayControlsParams, SettingsViewProps };
