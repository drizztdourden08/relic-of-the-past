/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

export type { ControlsSettingsProps };
