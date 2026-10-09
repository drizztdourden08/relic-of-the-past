/* @layer renderer-components @kind types */
import type { HudAnimationLoop, HudNode } from '@shared/types/hud';

interface AnimationSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  warnings: readonly string[];
  openIndex: number | null;
  onOpen: (index: number | null) => void;
}

interface LoopOption { value: HudAnimationLoop; label: string }

export type { AnimationSectionProps, LoopOption };
