/* @layer shared-hud @kind types */
import type { Paint } from '../../types/hud-value';
import type { HudBorder, HudOutline, HudRadius, HudShadow, HudTint } from '../../types/hud-style';

interface PaintOptions {
  required?: boolean;
  insideRepeat?: boolean;
}

interface StyleParts {
  background: Paint | undefined;
  border: HudBorder | undefined;
  radius: HudRadius | undefined;
  shadow: HudShadow[] | undefined;
  outline: HudOutline | undefined;
  tint: HudTint | undefined;
}

export type { PaintOptions, StyleParts };
