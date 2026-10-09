/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

export type { ControlsSettingsProps };
