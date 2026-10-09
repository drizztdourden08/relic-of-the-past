/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';

interface HudStyleControlProps {
  value: GameSettings['hudStyle'];
  settings: GameSettings;
  onChange: (value: GameSettings['hudStyle']) => void;
}

export type { HudStyleControlProps };
