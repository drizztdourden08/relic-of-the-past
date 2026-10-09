/* @layer renderer-components @kind types */
import type { HudContainer, HudNode } from '@shared/types/hud';

interface NodeSite {
  node: HudNode;
  parent: HudContainer | null;
  index: number;
}

export type { NodeSite };
