/* @layer shared-hud @kind types */
import type { HudNode } from '../types/hud-node';
import type { Rect } from '../layouts/geometry.type';

type Scope = Readonly<Record<string, number>>;

interface MeasureContext {
  hearts?: number;
  filledSlots?: readonly number[];
  scope?: Scope;
}

interface PlacedNode {
  id: string;
  node: HudNode;
  rect: Rect;
  scale: number;
  opacity: number;
  dimmed: boolean;
}

export type { MeasureContext, PlacedNode, Scope };
