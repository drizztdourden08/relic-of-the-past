/* @layer renderer-components @kind types */
import type { HudContainer, HudNode } from '@rotp/hud';

interface PlacementSectionProps {
  node: HudNode;
  parent: HudContainer | null;
  onSelectNode?: (id: string) => void;
  onPatch: (patch: Partial<HudNode>) => void;
}

export type { PlacementSectionProps };
