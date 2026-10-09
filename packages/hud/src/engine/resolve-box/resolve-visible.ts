/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import { scopeOf } from './scope-of';
import type { HudBox, HudElement } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';

const idleCountdown = (node: HudBox, ctx: MeasureContext): boolean =>
  'element' in node && (node as HudElement).element.type === 'countdown'
  && (scopeOf(ctx).countdown_active ?? 0) === 0;

const resolveVisible = (node: HudBox, ctx: MeasureContext): boolean => {
  if (idleCountdown(node, ctx)) return false;
  const { visible } = node;
  if (visible === undefined) return true;
  if (typeof visible === 'boolean') return visible;
  return resolveValue(visible, scopeOf(ctx)) !== 0;
};

export { resolveVisible };
