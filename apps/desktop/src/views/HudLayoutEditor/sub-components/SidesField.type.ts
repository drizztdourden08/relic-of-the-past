/* @layer renderer-components @kind types */
import type { HudBorderSides } from '@rotp/hud';

interface SidesFieldProps {
  label: string;
  value: HudBorderSides | undefined;
  onChange: (next: HudBorderSides | undefined) => void;
}

export type { SidesFieldProps };
