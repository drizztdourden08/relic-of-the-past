/* @layer shared-hud @kind logic */
/**
 * Bindable boxes: every `Value` on a `HudBox` or a flex/grid container,
 * resolved against one scope. The one seam `measure.ts`, `place.ts`,
 * `place-flow.ts` and `place-grid.ts` all call through, so "resolve before
 * measuring" (phase 2 of `plans/hud-data-binding.html`) is one rule enforced in
 * one place instead of four call sites agreeing by convention.
 *
 * Nothing here can fail. `resolveValue` never throws (a bad expression folds
 * to its documented default, see `shared/hud/data/resolve-value.ts`), so
 * neither does anything built on it.
 */

import { resolveValue } from '../data/resolve-value';
import type { HudBox, HudContainer, HudElement } from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';
import type { MeasureContext } from './engine.type';

/** The scope every bound field resolves against - an empty table when the
 *  caller gave none, which still resolves every literal number correctly. */
const scopeOf = (ctx: MeasureContext): Readonly<Record<string, number>> => ctx.scope ?? {};

/** Uniform multiplier over a node's own coordinate system. Default 1. */
const resolveScale = (node: HudBox, ctx: MeasureContext): number => resolveValue(node.scale ?? 1, scopeOf(ctx));

/** Clamped to 0-1 because a bound expression is not statically checked the way a
 *  literal is (`validate-box.ts`), so the engine holds the same floor and
 *  ceiling at runtime instead of trusting the result of an arbitrary formula. */
const resolveOpacity = (node: HudBox, ctx: MeasureContext): number => {
  const value = resolveValue(node.opacity ?? 1, scopeOf(ctx));
  return Math.min(1, Math.max(0, value));
};

/** A countdown with nothing counting (§62). It is the `countdown` kind's own
 *  rule, read here so it is the same rule `visible: false` already is: the
 *  node leaves the flow and takes no space, under both engines and at a root. */
const idleCountdown = (node: HudBox, ctx: MeasureContext): boolean =>
  'element' in node && (node as HudElement).element.type === 'countdown'
  && (scopeOf(ctx).countdown_active ?? 0) === 0;

/** `visible` keeps its boolean shorthand and gains a bound form beside it,
 *  resolved truthy when non-zero - the same reading a repeat's future count
 *  will give a resolved number. */
const resolveVisible = (node: HudBox, ctx: MeasureContext): boolean => {
  if (idleCountdown(node, ctx)) return false;
  const { visible } = node;
  if (visible === undefined) return true;
  if (typeof visible === 'boolean') return visible;
  return resolveValue(visible, scopeOf(ctx)) !== 0;
};

/**
 * A CONTAINER'S TWO GAPS - ONE RESOLVER FOR BOTH ENGINES (§57). `x` is always
 * horizontal and `y` always vertical, so nothing here has to know which engine
 * asked or which way a flex container flows; `flow.ts::flowGaps` is where a row
 * or a column turns that pair into a main and a cross gap.
 */
const resolveGap = (container: HudContainer, ctx: MeasureContext): { x: number; y: number } => {
  const scope = scopeOf(ctx);
  return {
    x: resolveValue(container.gap?.x ?? 0, scope),
    y: resolveValue(container.gap?.y ?? 0, scope),
  };
};

/** `Value | undefined` - undefined "is not a floor/ceiling", not zero,
 *  so `min`/`max` are read against these sentinels, not the number 0. */
const resolveBound = (value: Value | undefined, ctx: MeasureContext, fallback: number): number =>
  value === undefined ? fallback : resolveValue(value, scopeOf(ctx));

/** The floor and ceiling `min`/`max` put on a RESOLVED size, on top of however
 *  it was arrived at - fixed, `pct`, `auto` or `fill` alike (`hud-node.ts`'s own
 *  rule: "applies to every extent"). */
const clampToBox = (node: HudBox, axis: 'w' | 'h', resolved: number, ctx: MeasureContext): number => {
  const min = resolveBound(node.min?.[axis], ctx, -Infinity);
  const max = resolveBound(node.max?.[axis], ctx, Infinity);
  return Math.min(max, Math.max(min, resolved));
};

export {
  clampToBox, resolveBound, resolveGap, resolveOpacity, resolveScale, resolveVisible, scopeOf,
};
