/* @layer shared-hud @kind types */
import type { HudTextSpec } from '../types/hud-text';
import type { Paint, Value } from '../types/hud-value';

interface TextPaintParts {
  color: Paint | undefined;
  stroke: { width: Value; color: Paint } | undefined;
  align: 'start' | 'center' | 'end' | undefined;
  tracking: number | undefined;
}

type TextPaintFragment = Partial<Pick<HudTextSpec, 'color' | 'stroke' | 'align' | 'tracking'>>;

export type { TextPaintFragment, TextPaintParts };
