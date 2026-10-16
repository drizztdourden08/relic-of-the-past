/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';

interface GbaAvailability {
  hasSupplement: boolean;
  supplementFile: string | null;
}

interface GbaSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

export type { GbaAvailability, GbaSettingsProps };
