/* @layer renderer-components @kind types */
import type { HudNode } from '@shared/types/hud';

interface AppearanceSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { AppearanceSectionProps };
