/* @layer renderer-components @kind types */
import type { HudElementSpec } from '@rotp/hud';

type ShapeSpec = Extract<HudElementSpec, { type: 'shape' }>;

interface ShapeContentProps {
  spec: ShapeSpec;
  onChange: (patch: Partial<ShapeSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { ShapeContentProps, ShapeSpec };
