/* @layer renderer-components @kind types */
import type { HudNode } from '@rotp/hud';

interface AppearanceSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { AppearanceSectionProps };
