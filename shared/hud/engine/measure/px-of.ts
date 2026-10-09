/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { Extent } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';

const pxOf = (extent: Extent | undefined, ctx: MeasureContext): number | undefined => {
  if (!extent || typeof extent !== 'object') return undefined;
  const scope = ctx.scope ?? {};
  if ('expr' in extent) return resolveValue(extent, scope);
  if ('px' in extent) return resolveValue(extent.px, scope);
  return undefined;
};

export { pxOf };
