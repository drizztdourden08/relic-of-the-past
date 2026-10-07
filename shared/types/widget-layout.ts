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

/** How a popped window sits over other windows: never, always, or exactly as the app does. */
type PinMode = 'off' | 'top' | 'with-app';

/** A popped window held flush against the app or another popped window. */
interface SnapLink {
  to: 'main' | WidgetId;
  /** The edge of the target it touches. */
  edge: DockEdge;
}

/** Where a popped window's title bar was released over the app. */
interface WindowPoint {
  x: number;
  y: number;
}

interface PoppedWidget {
  id: WidgetId;
  bounds?: WindowBounds;
  /** Missing means 'off'. */
  pin?: PinMode;
  /** Missing means on. */
  snap?: boolean;
  link?: SnapLink | null;
}

/** The live window facts a popped window's renderer shows: the pin, whether it is on top right now, snapping. */
interface PoppedWindowState {
  pin: PinMode;
  onTop: boolean;
  snap: boolean;
  link: SnapLink | null;
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
  /** The window facts of widgets that came back in, so the next pop-out reopens the same way. */
  poppedMemory?: Partial<Record<WidgetId, PoppedWidget>>;
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
  DockEdge, DropTarget, FloatingWidget, GameNode, LayoutNode, LeafNode, PaneNode, PinMode, PoppedWidget,
  PoppedWindowState, Rect, SnapLink, SplitAxis, SplitNode, WidgetFrame, WidgetId, WidgetLayout, WindowBounds,
  WindowPoint,
};
