/* @layer renderer-components @kind types */
import type { HudAnimationLoop, HudNode } from '@rotp/hud';
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface AnimationSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  warnings: readonly string[];
  openIndex: number | null;
  onOpen: (index: number | null) => void;
}

interface LoopOption { value: HudAnimationLoop; label: Message }

export type { AnimationSectionProps, LoopOption };
