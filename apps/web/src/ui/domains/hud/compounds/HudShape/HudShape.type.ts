/* @layer renderer-hud @kind types */
import type { HudShapeSpec } from '@shared/types/hud';
import type { HeartMode } from '../../primitives/HudHeart';

interface HudShapeProps {
  spec: HudShapeSpec;
  scope: Readonly<Record<string, number>>;
  heartMode: HeartMode;
  scale: number;
}

export type { HudShapeProps };
