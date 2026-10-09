/* @layer renderer-components @kind types */
import type { HudBorderSides } from '@shared/types/hud';

type BorderSide = keyof HudBorderSides;

interface EdgesFieldProps {
  label: string;
  value: HudBorderSides | undefined;
  onChange: (next: HudBorderSides | undefined) => void;
}

export type { BorderSide, EdgesFieldProps };
