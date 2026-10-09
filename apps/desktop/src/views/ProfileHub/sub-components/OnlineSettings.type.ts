/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';

interface OnlineSettingsProps {
  profile: Profile | null;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

export type { OnlineSettingsProps };
