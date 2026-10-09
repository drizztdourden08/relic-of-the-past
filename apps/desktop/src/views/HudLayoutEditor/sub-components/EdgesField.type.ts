/* @layer renderer-components @kind types */
import type { HudBorderSides } from '@rotp/hud';

type BorderSide = keyof HudBorderSides;

interface EdgesFieldProps {
  label: string;
  value: HudBorderSides | undefined;
  onChange: (next: HudBorderSides | undefined) => void;
}

export type { BorderSide, EdgesFieldProps };
