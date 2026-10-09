/* @layer renderer-components @kind logic */
import { collectBoundValues } from '../bound-values';
import type { HudNode, HudTransitionProperty } from '@shared/types/hud';

const drivenProperties = (node: HudNode, insideRepeat: boolean): ReadonlySet<HudTransitionProperty> => {
  const bound = collectBoundValues(node).map((b) => b.path);
  const has = (prefix: string): boolean =>
    bound.some((p) => p === prefix || p.startsWith(`${prefix}.`) || p.startsWith(`${prefix}[`));
  const driven = new Set<HudTransitionProperty>();
  if (has('size') || has('min') || has('max')) driven.add('size');
  if (insideRepeat) driven.add('position');
  if (has('opacity')) driven.add('opacity');
  if (has('scale')) driven.add('scale');
  if (has('style.tint')) driven.add('tint');
  if (has('style.background') || has('element.color')) driven.add('color');
  return driven;
};

export { drivenProperties };
