/* @layer renderer-components @kind types */
import type { HudEasing } from '@rotp/hud';

interface EasingPickerProps {
  label: string;
  value: HudEasing | undefined;
  onChange: (next: HudEasing | undefined) => void;
  allowDefault?: boolean;
  unsetHint?: string;
}

interface EasingCurveTileProps { name: string; label: string; on: boolean; onPick: () => void }

export type { EasingCurveTileProps, EasingPickerProps };
