/* @layer renderer-components @kind types */
import type { HudAnimationKeyframe, HudEasing } from '@rotp/hud';

interface KeyframeTrackProps {
  keyframes: readonly HudAnimationKeyframe[];
  onChange: (next: HudAnimationKeyframe[]) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  easing?: HudEasing;
  endLabel: string;
  head: number | null;
}

export type { KeyframeTrackProps };
