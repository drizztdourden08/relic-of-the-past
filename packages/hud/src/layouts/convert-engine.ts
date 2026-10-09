/* @layer shared-hud @kind logic */
import { FLEX_ONLY, GRID_ONLY } from './convert-engine.constants';
import type { HudContainer, HudNode } from '../types/hud-node';
import type { EnginePatch } from './convert-engine.type';

const dropped = (keys: readonly string[]): EnginePatch =>
  Object.fromEntries(keys.map((key) => [key, undefined]));

const furthestColumn = (children: readonly HudNode[]): number =>
  children.reduce((max, child) => {
    const place = child.place;
    if (!place?.column) return max;
    return Math.max(max, place.column + (place.colSpan ?? 1) - 1);
  }, 1);

const toFlexPatch = (node: HudContainer): EnginePatch => {
  const direction = node.layout === 'grid' && node.columns.length <= 1 ? 'column' : 'row';
  return { ...dropped(GRID_ONLY), layout: 'flex', direction };
};

const toGridPatch = (node: HudContainer): EnginePatch => {
  const isRow = node.layout !== 'grid' && node.direction === 'row';
  const count = Math.max(1, isRow ? node.children.length : 1, furthestColumn(node.children));
  return {
    ...dropped(FLEX_ONLY),
    layout: 'grid',
    columns: Array.from({ length: count }, () => 'auto'),
  };
};

const engineSwitchPatch = (node: HudContainer, engine: 'flex' | 'grid'): EnginePatch | null => {
  const current = node.layout === 'grid' ? 'grid' : 'flex';
  if (current === engine) return null;
  return engine === 'grid' ? toGridPatch(node) : toFlexPatch(node);
};

export { engineSwitchPatch };
