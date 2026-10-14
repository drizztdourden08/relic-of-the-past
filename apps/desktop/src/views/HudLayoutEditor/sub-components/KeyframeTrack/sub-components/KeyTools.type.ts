/* @layer renderer-components @kind types */
import type { HudAnimationKeyframe } from '@rotp/hud';

interface KeyToolsProps {
  keyframes: readonly HudAnimationKeyframe[];
  selected: number;
  at: number;
  onAdd: (at: number) => void;
  onChange: (next: HudAnimationKeyframe[]) => void;
  onSelect: (index: number) => void;
}

export type { KeyToolsProps };
