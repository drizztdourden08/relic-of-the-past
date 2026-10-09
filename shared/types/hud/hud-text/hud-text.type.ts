/* @layer shared-types @kind types */
import type { Paint, Value } from '../hud-value';

type HudTextPad = 'none' | 'zero' | 'space';

interface HudTextFormat { digits?: number; pad?: HudTextPad }

type HudTextSpriteSet = 'hud-digits' | 'pause-letters';

type HudFontFamily = 'game' | 'sans' | 'mono';

type HudTextFace =
  | { from: 'sprite'; set: HudTextSpriteSet }
  | { from: 'font'; family: HudFontFamily; size: number; weight?: number };

interface HudTextStroke { width: Value; color: Paint }

type HudTextAlign = 'start' | 'center' | 'end';

interface HudTextSpec {
  type: 'text';
  value: Value | string;
  format?: HudTextFormat;
  face: HudTextFace;
  color?: Paint;
  stroke?: HudTextStroke;
  align?: HudTextAlign;
  tracking?: number;
}

export type {
  HudFontFamily, HudTextAlign, HudTextFace, HudTextFormat, HudTextPad, HudTextSpec, HudTextSpriteSet, HudTextStroke,
};
