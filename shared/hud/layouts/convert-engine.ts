/* @layer shared-hud @kind logic */
/**
 * Switching a container between the two layout engines, as a PATCH that really
 * converts it.
 *
 * WHY THIS IS A FILE. The editor applies edits through `patchNode`, which
 * shallow-MERGES. Handing it a freshly built flex container therefore did not
 * replace a grid - it laid `layout: 'flex'` over one, leaving `columns`, `rows`,
 * `justifyItems` and `alignItems` behind (a document the validator refuses, so
 * it could never be saved) and, worse, leaving a grid's `gap: { x, y }` where a
 * flex container read a single `Value`. The layout pass then resolved
 * `gap.expr` of an object with no `expr` and threw, and with nothing above the
 * stage to catch it the whole editor went down. It only needed a gap to have
 * been set first - which is the first thing anyone does to a grid.
 *
 * So the patch names every key the OTHER engine owns as `undefined`, which is
 * how `patchNode` is told to drop a key.
 *
 * THERE IS NO LONGER A KEY THE TWO ENGINES SPELL DIFFERENTLY (§57). `gap` is
 * `{ x, y }` under both - `x` horizontal, `y` vertical, whatever the direction -
 * and `guide` belongs to any container, so BOTH PASS STRAIGHT THROUGH: this
 * file names neither, and a flip there and back cannot lose or reshape either.
 * The crash that made this file necessary is gone at the root, not
 * worked around here.
 *
 * CHILDREN ARE LEFT ALONE. A child's `place` / `justifySelf` are legal on any
 * box and unread under flex, so flipping to flex and back restores the
 * arrangement instead of destroying it.
 *
 * THE SHAPE SURVIVES THE FLIP where it cheaply can: a one-column grid becomes a
 * flex COLUMN; a flex row of N children becomes N columns, so they still sit
 * side by side under auto-flow. Columns are never fewer than the furthest cell a
 * child already names, so no placement is left out of range.
 */
import type { HudContainer, HudNode } from '../../types/hud/hud-node';

type EnginePatch = Record<string, unknown>;

const GRID_ONLY = ['columns', 'rows', 'justifyItems', 'alignItems'] as const;
const FLEX_ONLY = ['direction', 'justify', 'align', 'wrap'] as const;

const dropped = (keys: readonly string[]): EnginePatch =>
  Object.fromEntries(keys.map((key) => [key, undefined]));

/** The furthest column any child already asks for, so a conversion never
 *  strands an explicit placement outside the new grid. */
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

/** The patch that turns `node` into the other engine, or `null` when it is
 *  already that engine - so a click on the lit button writes nothing. */
const engineSwitchPatch = (node: HudContainer, engine: 'flex' | 'grid'): EnginePatch | null => {
  const current = node.layout === 'grid' ? 'grid' : 'flex';
  if (current === engine) return null;
  return engine === 'grid' ? toGridPatch(node) : toFlexPatch(node);
};

export { engineSwitchPatch };
export type { EnginePatch };
