/* @layer renderer-components @kind types */
import type { HudNode } from '@rotp/hud';

interface DataSectionProps {
  node: HudNode;
  scope: Readonly<Record<string, number>>;
}

export type { DataSectionProps };
