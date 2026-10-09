/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import { scopeOf } from './scope-of';
import type { HudBox } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';

const resolveOpacity = (node: HudBox, ctx: MeasureContext): number => {
  const value = resolveValue(node.opacity ?? 1, scopeOf(ctx));
  return Math.min(1, Math.max(0, value));
};

export { resolveOpacity };
