/* @layer shared-hud @kind logic */
/**
 * One `Extent` against the space it was stated in - shared by the flex flow
 * (`place-flow.ts`), the grid tracks (`grid-cells.ts`) and a region's own root
 * (`layout.ts`), which is why it lives on its own instead of inside any one
 * of them. `fill` survives as a marker because it cannot be answered until
 * every fixed sibling has been - the caller resolves it once it knows what is
 * left.
 */

import { resolveValue } from '../data/resolve-value';
import type { Extent } from '../../types/hud/hud-node';
import type { MeasureContext } from './engine.type';

const FILL = 'fill';

const resolveExtent = (
  extent: Extent | undefined,
  natural: number,
  available: number,
  ctx: MeasureContext,
): number | typeof FILL => {
  if (extent === undefined || extent === 'auto') return natural;
  if (extent === FILL) return FILL;
  const scope = ctx.scope ?? {};
  if ('expr' in extent) return resolveValue(extent, scope);   // bare Value - `px` shorthand
  if ('px' in extent) return resolveValue(extent.px, scope);
  return Number.isFinite(available) ? (available * resolveValue(extent.pct, scope)) / 100 : natural;
};

export { FILL, resolveExtent };
