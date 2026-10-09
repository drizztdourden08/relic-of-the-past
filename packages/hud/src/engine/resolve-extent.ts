/* @layer shared-hud @kind logic */
import { resolveValue } from '../data/resolve-value';
import { FILL } from './resolve-extent.constants';
import type { Extent } from '../types/hud-node';
import type { MeasureContext } from './engine.type';

const resolveExtent = (
  extent: Extent | undefined,
  natural: number,
  available: number,
  ctx: MeasureContext,
): number | typeof FILL => {
  if (extent === undefined || extent === 'auto') return natural;
  if (extent === FILL) return FILL;
  const scope = ctx.scope ?? {};
  if ('expr' in extent) return resolveValue(extent, scope);
  if ('px' in extent) return resolveValue(extent.px, scope);
  return Number.isFinite(available) ? (available * resolveValue(extent.pct, scope)) / 100 : natural;
};

export { resolveExtent };
