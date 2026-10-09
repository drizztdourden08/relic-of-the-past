/* @layer shared-types @kind types */
import type { Paint, Value } from '../hud-value';

interface HudBorderSides { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean }

type HudBorderStyle = 'solid' | 'dashed' | 'dotted';

interface HudBorder {
  width: Value;
  color: Paint;
  style?: HudBorderStyle;
  sides?: HudBorderSides;
}

type HudRadius = Value | [Value, Value, Value, Value];

interface HudShadow {
  x: Value;
  y: Value;
  blur: Value;
  spread?: Value;
  color: Paint;
  inset?: boolean;
}

interface HudOutline {
  width: Value;
  color: Paint;
}

type HudTintMode = 'multiply' | 'replace';

interface HudTint {
  color: Paint;
  mode?: HudTintMode;
  amount?: Value;
}

interface HudBoxStyle {
  background?: Paint;
  border?: HudBorder;
  radius?: HudRadius;
  shadow?: HudShadow[];
  outline?: HudOutline;
  tint?: HudTint;
  clip?: boolean;
}

export type {
  HudBorder, HudBorderSides, HudBorderStyle, HudBoxStyle, HudOutline, HudRadius, HudShadow, HudTint, HudTintMode,
};
