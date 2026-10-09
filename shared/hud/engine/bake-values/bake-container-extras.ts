/* @layer shared-hud @kind logic */
import { bakeExtent } from './bake-extent';
import { bakeValue } from './bake-value';
import type { Extent, HudContainer } from '../../../types/hud/hud-node';
import type { Scope } from '../engine.type';

const bakeContainerExtras = (node: HudContainer, scope: Scope): Partial<HudContainer> => {
  const gap = node.gap ? { gap: { x: bakeValue(node.gap.x, scope), y: bakeValue(node.gap.y, scope) } } : {};
  if (node.layout !== 'grid') return gap;
  return {
    columns: node.columns.map((c) => bakeExtent(c, scope) as Extent),
    ...(node.rows ? { rows: node.rows.map((r) => bakeExtent(r, scope) as Extent) } : {}),
    ...gap,
  };
};

export { bakeContainerExtras };
