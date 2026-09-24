/* @layer shared-types @kind types */
/**
 * The widget layout, version 2: one split tree that tiles the window around the
 * game, plus the widgets floating over the game and the ones in their own OS
 * windows. Shared with electron, which only needs the pop-out bounds.
 */

/** A widget's id, as WIDGET_DEFINITIONS names it ('inventory', 'checks', ...). */
type WidgetId = string;

type DockEdge = 'left' | 'right' | 'top' | 'bottom';

/** Children of a row lie left to right; of a column, top to bottom. */
type SplitAxis = 'row' | 'column';

/** A pane holds one or more widgets as tabs; one is on top. */
interface PaneNode {
  kind: 'pane';
  key: string;
  widgets: WidgetId[];
  active: WidgetId;
  /** On, the game gives up this pane's space; off, the pane overlays the picture. */
  makeRoom: boolean;
}

/** The play area. Exactly one, anywhere in the tree, movable like a pane but never a tab. */
interface GameNode {
  kind: 'game';
  key: 'game';
}

/** Children along the axis; sizes are fractions of the split that sum to 1. */
interface SplitNode {
  kind: 'split';
  axis: SplitAxis;
  children: LayoutNode[];
  sizes: number[];
}

type LayoutNode = PaneNode | GameNode | SplitNode;
type LeafNode = PaneNode | GameNode;

/** Position as fractions of the game's rectangle, so it moves and scales with the game; size in px. */
interface FloatingWidget {
  id: WidgetId;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PoppedWidget {
  id: WidgetId;
  bounds?: WindowBounds;
}

interface WidgetFrame {
  /** 0 to 1, the frame only (background, border, shadow). */
  opacity: number;
  show: 'always' | 'game-only';
}

interface WidgetLayout {
  v: 2;
  /** Exactly one GameNode leaf, always. */
  dock: LayoutNode;
  floating: FloatingWidget[];
  popped: PoppedWidget[];
  /** Per widget, wherever it is; a missing entry takes the defaults. */
  frame: Partial<Record<WidgetId, WidgetFrame>>;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where a dragged leaf may land. */
type DropTarget =
  | { at: 'outer'; edge: DockEdge }
  | { at: 'leaf'; key: string; edge: DockEdge }
  | { at: 'tab'; key: string }
  | { at: 'float' };

export type {
  DockEdge, DropTarget, FloatingWidget, GameNode, LayoutNode, LeafNode, PaneNode, PoppedWidget, Rect,
  SplitAxis, SplitNode, WidgetFrame, WidgetId, WidgetLayout, WindowBounds,
};
