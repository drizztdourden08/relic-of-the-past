/* @layer renderer-components @kind logic */
/**
 * Sizes a layout tree into rectangles: every leaf (pane or game) gets one, and
 * every gap between two children of a split becomes a divider. While peeking,
 * a subtree holding no game folds to a title strip so the game takes the room.
 * The game rect is the game leaf grown over its overlay neighbours, the panes
 * that do not make room.
 */
import type { LayoutNode, LeafNode, Rect, SplitAxis, SplitNode } from '@shared/types/widget-layout';

/** Space between two siblings, which is also the divider's thickness. */
const GAP = 8;
/** A pane folded to its title bar while peeking. */
const STRIP = 30;

interface LeafRect {
  node: LeafNode;
  rect: Rect;
}

interface DividerRect {
  node: SplitNode;
  /** The divider sits after this child. */
  index: number;
  rect: Rect;
  /** The split's length along its axis, so a pointer delta converts to a fraction. */
  along: number;
}

interface LaidOut {
  leaves: LeafRect[];
  dividers: DividerRect[];
}

const holdsGame = (node: LayoutNode): boolean =>
  node.kind === 'game' || (node.kind === 'split' && node.children.some(holdsGame));

const slice = (rect: Rect, axis: SplitAxis, at: number, len: number): Rect =>
  axis === 'row'
    ? { x: at, y: rect.y, width: len, height: rect.height }
    : { x: rect.x, y: at, width: rect.width, height: len };

const layoutNode = (node: LayoutNode, rect: Rect, out: LaidOut, peek: boolean): void => {
  if (node.kind !== 'split') {
    out.leaves.push({ node, rect });
    return;
  }
  const along = node.axis === 'row' ? rect.width : rect.height;
  const fixed = node.children.map((child) => (peek && !holdsGame(child) ? STRIP : null));
  const fixedSum = fixed.reduce<number>((sum, f) => sum + (f ?? 0), 0);
  const free = along - GAP * (node.children.length - 1) - fixedSum;
  const flex = node.sizes.reduce((sum, size, i) => sum + (fixed[i] === null ? size : 0), 0) || 1;
  let at = node.axis === 'row' ? rect.x : rect.y;
  node.children.forEach((child, i) => {
    const len = fixed[i] ?? (free * node.sizes[i]) / flex;
    layoutNode(child, slice(rect, node.axis, at, len), out, peek);
    at += len;
    if (i < node.children.length - 1) {
      out.dividers.push({ node, index: i, rect: slice(rect, node.axis, at, GAP), along });
      at += GAP;
    }
  });
};

const layoutTree = (tree: LayoutNode, rect: Rect, peek = false): LaidOut => {
  const out: LaidOut = { leaves: [], dividers: [] };
  layoutNode(tree, rect, out, peek);
  return out;
};

const rectOf = (laid: LaidOut, key: string): Rect | null =>
  laid.leaves.find((leaf) => leaf.node.key === key)?.rect ?? null;

/** Two rects that sit across one gap from each other, sharing part of an edge. */
const touching = (a: Rect, b: Rect): boolean => {
  const besides = Math.abs(a.x + a.width + GAP - b.x) < 1 || Math.abs(b.x + b.width + GAP - a.x) < 1;
  const stacked = Math.abs(a.y + a.height + GAP - b.y) < 1 || Math.abs(b.y + b.height + GAP - a.y) < 1;
  const overlapY = a.y < b.y + b.height && b.y < a.y + a.height;
  const overlapX = a.x < b.x + b.width && b.x < a.x + a.width;
  return (besides && overlapY) || (stacked && overlapX);
};

const union = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
};

/** The play area: the game leaf, grown over every neighbouring pane that does not make room. */
const gameRectOf = (laid: LaidOut): Rect | null => {
  const game = laid.leaves.find((leaf) => leaf.node.kind === 'game');
  if (!game) return null;
  let rect = game.rect;
  for (const leaf of laid.leaves) {
    if (leaf.node.kind !== 'pane' || leaf.node.makeRoom || !touching(rect, leaf.rect)) continue;
    rect = union(rect, leaf.rect);
  }
  return rect;
};

export { GAP, STRIP, gameRectOf, holdsGame, layoutTree, rectOf };
export type { DividerRect, LaidOut, LeafRect };
