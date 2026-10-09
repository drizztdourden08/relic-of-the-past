/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import { scopeOf } from './scope-of';
import type { Value } from '../../types/hud-value';
import type { MeasureContext } from '../engine.type';

const resolveBound = (value: Value | undefined, ctx: MeasureContext, fallback: number): number =>
  value === undefined ? fallback : resolveValue(value, scopeOf(ctx));

export { resolveBound };
