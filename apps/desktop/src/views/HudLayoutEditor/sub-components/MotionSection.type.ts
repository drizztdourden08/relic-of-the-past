/* @layer renderer-components @kind types */
import type { HudNode, ReflowWarning } from '@rotp/hud';

type MotionBlock = 'animations' | 'transitions' | 'enterExit';

interface MotionSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  warnings: readonly ReflowWarning[];
}

export type { MotionBlock, MotionSectionProps };
