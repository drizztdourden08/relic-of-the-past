/* @layer renderer-components @kind types */
import type { HudNode } from '@rotp/hud';

interface SizeBoxSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  isScreen?: boolean;
}

export type { SizeBoxSectionProps };
