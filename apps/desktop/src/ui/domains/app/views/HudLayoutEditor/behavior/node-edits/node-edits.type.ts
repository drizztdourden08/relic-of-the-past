/* @layer renderer-components @kind types */
import type { HudContainer, HudNode } from '@rotp/hud';

interface NodeSite {
  node: HudNode;
  parent: HudContainer | null;
  index: number;
}

export type { NodeSite };
