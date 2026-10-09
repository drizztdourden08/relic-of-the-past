/* @layer shared-hud @kind types */
import type { HudNode } from '../../types/hud/hud-node';

interface HudPreset {
  id: string;
  name: string;
  icon: string;
  template: HudNode;
}

export type { HudPreset };
