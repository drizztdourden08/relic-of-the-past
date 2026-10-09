/* @layer shared-hud @kind logic */
import type { HudNode } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';

const isDimmed = (node: HudNode, ctx: MeasureContext): boolean => {
  const slots = node.dimWhenEmpty;
  if (!slots || slots.length === 0) return false;
  const filled = ctx.filledSlots ?? [];
  return !slots.some((slot) => filled.includes(slot));
};

export { isDimmed };
