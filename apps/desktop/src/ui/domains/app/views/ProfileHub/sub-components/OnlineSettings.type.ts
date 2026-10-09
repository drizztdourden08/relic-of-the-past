/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';

interface OnlineSettingsProps {
  profile: Profile | null;
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

export type { OnlineSettingsProps };
