/* @layer renderer-components @kind logic */
/**
 * Pure edits of a layout tree, each returning a new tree: take a leaf or a
 * widget out, put a leaf in at a drop target, resize or even out a split, swap
 * two panes, patch a pane. A split left with one child collapses into it, so
 * the tree never carries an empty level.
 */
import type { DockEdge, DropTarget, GameNode, LayoutNode, LeafNode, PaneNode, SplitNode, WidgetId } from '@shared/types/widget-layout';

/** How much of a split a new leaf takes: the game is the big piece, a pane beside the game a strip. */
const SHARE = { gameBesidePane: 0.7, paneBesideGame: 0.26, paneBesidePane: 0.5, outerPane: 0.22, outerGame: 0.7 } as const;
const MIN_SIZE = 0.08;

let keySeq = 0;
const newPaneKey = (): string => `p${Date.now().toString(36)}${(keySeq++).toString(36)}`;

const createPane = (widgets: WidgetId[], makeRoom = true): PaneNode =>
  ({ kind: 'pane', key: newPaneKey(), widgets: [...widgets], active: widgets[0], makeRoom });

const GAME_NODE: GameNode = { kind: 'game', key: 'game' };

const isFirst = (edge: DockEdge): boolean => edge === 'left' || edge === 'top';
const axisOf = (edge: DockEdge): SplitNode['axis'] => (edge === 'left' || edge === 'right' ? 'row' : 'column');

const findLeaf = (node: LayoutNode, key: string): LeafNode | null => {
  if (node.kind === 'split') {
    for (const child of node.children) {
      const hit = findLeaf(child, key);
      if (hit) return hit;
    }
    return null;
  }
  return node.key === key ? node : null;
};

const normalize = (sizes: number[]): number[] => {
  const total = sizes.reduce((a, b) => a + b, 0) || 1;
  return sizes.map((s) => s / total);
};

/** Rebuilds a split from the children a step kept, collapsing a lone child into its place. */
const rebuild = (node: SplitNode, kept: (LayoutNode | null)[]): LayoutNode | null => {
  const children: LayoutNode[] = [];
  const sizes: number[] = [];
  kept.forEach((child, i) => {
    if (child) { children.push(child); sizes.push(node.sizes[i]); }
  });
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { ...node, children, sizes: normalize(sizes) };
};

/** The tree without that leaf; null when nothing is left. */
const removeLeaf = (node: LayoutNode, key: string): LayoutNode | null => {
  if (node.kind !== 'split') return node.key === key ? null : node;
  return rebuild(node, node.children.map((child) => removeLeaf(child, key)));
};

/** The tree without that widget; a pane emptied by it goes too. */
const removeWidget = (node: LayoutNode, id: WidgetId): LayoutNode | null => {
  if (node.kind === 'game') return node;
  if (node.kind === 'pane') {
    if (!node.widgets.includes(id)) return node;
    const widgets = node.widgets.filter((w) => w !== id);
    if (widgets.length === 0) return null;
    return { ...node, widgets, active: widgets.includes(node.active) ? node.active : widgets[0] };
  }
  return rebuild(node, node.children.map((child) => removeWidget(child, id)));
};

const shareFor = (leaf: LeafNode, beside: LeafNode): number => {
  if (leaf.kind === 'game') return SHARE.gameBesidePane;
  return beside.kind === 'game' ? SHARE.paneBesideGame : SHARE.paneBesidePane;
};

/** A split of `node` and `leaf`, the leaf on the side the edge names. */
const wrap = (node: LayoutNode, edge: DockEdge, leaf: LeafNode, share: number): SplitNode => {
  const first = isFirst(edge);
  return {
    kind: 'split',
    axis: axisOf(edge),
    children: first ? [leaf, node] : [node, leaf],
    sizes: first ? [share, 1 - share] : [1 - share, share],
  };
};

const insertBeside = (node: LayoutNode, leaf: LeafNode, key: string, edge: DockEdge): LayoutNode => {
  if (node.kind !== 'split') return node.key === key ? wrap(node, edge, leaf, shareFor(leaf, node)) : node;
  const index = node.children.findIndex((child) => child.kind !== 'split' && child.key === key);
  if (index >= 0 && axisOf(edge) === node.axis) {
    // Same axis as the parent: a new sibling, taking part of the target's share.
    const target = node.children[index] as LeafNode;
    const at = isFirst(edge) ? index : index + 1;
    const children = [...node.children];
    const sizes = [...node.sizes];
    const share = sizes[index] * shareFor(leaf, target);
    sizes[index] -= share;
    children.splice(at, 0, leaf);
    sizes.splice(at, 0, share);
    return { ...node, children, sizes };
  }
  return { ...node, children: node.children.map((child) => insertBeside(child, leaf, key, edge)) };
};

const joinTabs = (node: LayoutNode, key: string, widgets: WidgetId[]): LayoutNode => {
  if (node.kind === 'pane') return node.key === key ? { ...node, widgets: [...node.widgets, ...widgets], active: widgets[0] } : node;
  if (node.kind === 'split') return { ...node, children: node.children.map((child) => joinTabs(child, key, widgets)) };
  return node;
};

/** The tree with `leaf` placed at the target. A tab target takes a pane's widgets, never the game. */
const insertAt = (tree: LayoutNode, leaf: LeafNode, target: Exclude<DropTarget, { at: 'float' }>): LayoutNode => {
  if (target.at === 'outer') return wrap(tree, target.edge, leaf, leaf.kind === 'game' ? SHARE.outerGame : SHARE.outerPane);
  if (target.at === 'tab') return leaf.kind === 'pane' ? joinTabs(tree, target.key, leaf.widgets) : tree;
  return insertBeside(tree, leaf, target.key, target.edge);
};

const mapSplit = (node: LayoutNode, target: SplitNode, fn: (split: SplitNode) => SplitNode): LayoutNode => {
  if (node.kind !== 'split') return node;
  if (node === target) return fn(node);
  return { ...node, children: node.children.map((child) => mapSplit(child, target, fn)) };
};

/** Moves the divider after child `index` by `delta` (a fraction of the split), keeping both sides above the minimum. */
const resizeSplit = (tree: LayoutNode, target: SplitNode, index: number, delta: number): LayoutNode =>
  mapSplit(tree, target, (split) => {
    const a = split.sizes[index] + delta;
    const b = split.sizes[index + 1] - delta;
    if (a < MIN_SIZE || b < MIN_SIZE) return split;
    const sizes = [...split.sizes];
    sizes[index] = a;
    sizes[index + 1] = b;
    return { ...split, sizes };
  });

/** Gives the two children around a divider the same size. */
const evenSplit = (tree: LayoutNode, target: SplitNode, index: number): LayoutNode =>
  mapSplit(tree, target, (split) => {
    const sizes = [...split.sizes];
    const half = (sizes[index] + sizes[index + 1]) / 2;
    sizes[index] = half;
    sizes[index + 1] = half;
    return { ...split, sizes };
  });

/** Exchanges two panes in place. */
const swapPanes = (tree: LayoutNode, keyA: string, keyB: string): LayoutNode => {
  const a = findLeaf(tree, keyA);
  const b = findLeaf(tree, keyB);
  if (!a || !b || a.kind !== 'pane' || b.kind !== 'pane') return tree;
  const swap = (node: LayoutNode): LayoutNode => {
    if (node.kind === 'split') return { ...node, children: node.children.map(swap) };
    if (node.key === keyA) return b;
    if (node.key === keyB) return a;
    return node;
  };
  return swap(tree);
};

const patchPane = (tree: LayoutNode, key: string, patch: Partial<Omit<PaneNode, 'kind' | 'key'>>): LayoutNode => {
  if (tree.kind === 'pane') return tree.key === key ? { ...tree, ...patch } : tree;
  if (tree.kind === 'split') return { ...tree, children: tree.children.map((child) => patchPane(child, key, patch)) };
  return tree;
};

const paneOf = (node: LayoutNode, id: WidgetId): PaneNode | null => {
  if (node.kind === 'pane') return node.widgets.includes(id) ? node : null;
  if (node.kind === 'split') {
    for (const child of node.children) {
      const hit = paneOf(child, id);
      if (hit) return hit;
    }
  }
  return null;
};

const widgetsIn = (node: LayoutNode): WidgetId[] => {
  if (node.kind === 'pane') return node.widgets;
  if (node.kind === 'split') return node.children.flatMap(widgetsIn);
  return [];
};

export {
  GAME_NODE, createPane, evenSplit, findLeaf, insertAt, paneOf, patchPane, removeLeaf, removeWidget, resizeSplit,
  swapPanes, widgetsIn,
};
