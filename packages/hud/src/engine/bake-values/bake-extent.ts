/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { Extent } from '../../types/hud-node';
import type { Scope } from '../engine.type';

const bakeExtent = (extent: Extent | undefined, scope: Scope): Extent | undefined => {
  if (extent === undefined || extent === 'auto' || extent === 'fill') return extent;
  if ('px' in extent) return { px: resolveValue(extent.px, scope) };
  if ('pct' in extent) return { pct: resolveValue(extent.pct, scope) };
  const pxShorthand = extent;
  return { px: resolveValue(pxShorthand, scope) };
};

export { bakeExtent };
