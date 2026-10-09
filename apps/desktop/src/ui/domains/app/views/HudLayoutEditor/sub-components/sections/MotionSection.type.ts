/* @layer renderer-components @kind types */
import type { HudNode } from '@shared/types/hud';

type MotionBlock = 'animations' | 'transitions' | 'enterExit';

interface MotionSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  warnings: readonly string[];
}

export type { MotionBlock, MotionSectionProps };
