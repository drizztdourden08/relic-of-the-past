/* @layer renderer-components @kind types */
import type { HudAnimation, ReflowWarning } from '@rotp/hud';

interface AnimationGroupProps {
  animation: HudAnimation;
  duration: number;
  head: number | null;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<HudAnimation>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  warnings: readonly ReflowWarning[];
}

export type { AnimationGroupProps };
