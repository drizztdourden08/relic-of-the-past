/* @layer shared-types @kind types */
import type { Value } from '../hud-value';

type HudShapeKind = 'heart' | 'magic-bar';

interface HudShapeSpec {
  type: 'shape';
  shape: HudShapeKind;
  fill: Value;
  armor?: Value;
  bands?: Value;
}

export type { HudShapeKind, HudShapeSpec };
