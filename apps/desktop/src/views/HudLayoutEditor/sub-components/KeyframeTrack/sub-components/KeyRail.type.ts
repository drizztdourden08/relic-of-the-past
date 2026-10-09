/* @layer renderer-components @kind types */
import type { HudAnimationKeyframe } from '@rotp/hud';

interface KeyRailProps {
  keyframes: readonly HudAnimationKeyframe[];
  selected: number;
  onSelect: (index: number) => void;
  onMove: (index: number, at: number) => void;
  onAdd: (at: number) => void;
  head: number | null;
  endLabel: string;
}

export type { KeyRailProps };
