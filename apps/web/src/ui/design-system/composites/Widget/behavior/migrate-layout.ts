/* @layer renderer-components @kind logic */
/**
 * Brings a stored widget layout up to the current shape. A v2 record passes
 * through after a light check; a v1 record (one flat list of widgets, each
 * docked on a side or floating in window pixels) is rebuilt as a split tree
 * around the game; anything else starts from the default.
 */
import type { DockEdge, LayoutNode, PaneNode, SplitNode, WidgetFrame, WidgetLayout } from '@shared/types/widget-layout';
import { GAME_NODE, createPane } from '../../DockLayout/behavior/edit-tree';
import { toFloating } from '../../DockLayout/behavior/place-floating';
import { createDefaultLayout } from './createWidgetState';

/** The shape the layout had before the split tree. */
interface WidgetStateV1 {
  id: string;
  mode: 'docked' | 'floating';
  side: DockEdge;
  order: number;
  opacity: number;
  visibility: 'always' | 'game-only';
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  dockedSize: number;
  exclusive: boolean;
}

interface WidgetLayoutV1 {
  widgets: WidgetStateV1[];
}

const SIDES: DockEdge[] = ['left', 'right', 'top', 'bottom'];
const OUTER_SHARE = 0.22;
const MIN_SHARE = 0.12;
const MAX_SHARE = 0.45;

const isRecord = (raw: unknown): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null;

const isV1 = (raw: unknown): raw is WidgetLayoutV1 =>
  isRecord(raw) && Array.isArray(raw.widgets) && raw.widgets.every((w) => isRecord(w) && typeof w.id === 'string');

const countGame = (node: LayoutNode): number =>
  node.kind === 'game' ? 1 : node.kind === 'split' ? node.children.reduce((n, c) => n + countGame(c), 0) : 0;

const isV2 = (raw: unknown): raw is WidgetLayout =>
  isRecord(raw) && raw.v === 2 && isRecord(raw.dock) && Array.isArray(raw.floating) && Array.isArray(raw.popped)
  && isRecord(raw.frame) && countGame(raw.dock as unknown as LayoutNode) === 1;

/** The window as the game rect: the tree has no rects until it first renders. */
const windowRect = () => ({
  x: 0,
  y: 0,
  width: typeof window === 'undefined' ? 0 : window.innerWidth,
  height: typeof window === 'undefined' ? 0 : window.innerHeight,
});

const outerShare = (side: DockEdge, dockedSize: number): number => {
  const along = side === 'left' || side === 'right' ? windowRect().width : windowRect().height;
  if (!(along > 0) || !(dockedSize > 0)) return OUTER_SHARE;
  return Math.min(MAX_SHARE, Math.max(MIN_SHARE, dockedSize / along));
};

/** One pane per widget, stacked along the side, as a single node. */
const stackOf = (panes: PaneNode[], side: DockEdge): LayoutNode => {
  if (panes.length === 1) return panes[0];
  const split: SplitNode = {
    kind: 'split',
    axis: side === 'left' || side === 'right' ? 'column' : 'row',
    children: panes,
    sizes: panes.map(() => 1 / panes.length),
  };
  return split;
};

/** Wraps the tree so `stack` sits on the side named, taking `share` of the whole. */
const wrapOuter = (tree: LayoutNode, stack: LayoutNode, side: DockEdge, share: number): SplitNode => {
  const first = side === 'left' || side === 'top';
  return {
    kind: 'split',
    axis: side === 'left' || side === 'right' ? 'row' : 'column',
    children: first ? [stack, tree] : [tree, stack],
    sizes: first ? [share, 1 - share] : [1 - share, share],
  };
};

const fromV1 = (v1: WidgetLayoutV1): WidgetLayout => {
  const visible = v1.widgets.filter((w) => w.visible);
  let dock: LayoutNode = GAME_NODE;
  for (const side of SIDES) {
    const docked = visible.filter((w) => w.mode === 'docked' && w.side === side).sort((a, b) => a.order - b.order);
    if (docked.length === 0) continue;
    const panes = docked.map((w) => createPane([w.id], w.exclusive));
    const widest = Math.max(...docked.map((w) => w.dockedSize));
    dock = wrapOuter(dock, stackOf(panes, side), side, outerShare(side, widest));
  }
  const game = windowRect();
  const floating = visible
    .filter((w) => w.mode === 'floating')
    .map((w) => toFloating(w.id, { x: w.x, y: w.y, width: w.width, height: w.height }, game));
  const frame: Partial<Record<string, WidgetFrame>> = {};
  for (const w of v1.widgets) frame[w.id] = { opacity: w.opacity, show: w.visibility };
  return { v: 2, dock, floating, popped: [], frame };
};

const migrateLayout = (raw: unknown): WidgetLayout => {
  if (isV2(raw)) return raw;
  if (isV1(raw)) return fromV1(raw);
  return createDefaultLayout();
};

export { migrateLayout };
export type { WidgetLayoutV1, WidgetStateV1 };
