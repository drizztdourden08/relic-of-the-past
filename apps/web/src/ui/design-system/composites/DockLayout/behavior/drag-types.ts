/* @layer renderer-components @kind types */
import type { FloatingWidget, Rect, WidgetId, WidgetLayout } from '@shared/types/widget-layout';
import type { DragModifiers } from '../DockLayout.type';
import type { DropZone } from './hit-target';
import type { LaidOut } from './layout-tree';

interface Point {
  x: number;
  y: number;
}

/** What went down under the pointer, fixed for the whole drag. */
interface DragSource {
  /** The widget; null for the game. */
  id: WidgetId | null;
  isGame: boolean;
  /** The pane or game leaf it comes from; null for a floating widget. */
  fromKey: string | null;
  /** Down on one tab chip, so a still release activates it. */
  fromTab: boolean;
  floating: FloatingWidget | null;
  /** The source pane holds only this widget, so it goes away with the drop. */
  loneWidget: boolean;
  /** Where the pointer went down, in stage coordinates. */
  start: Point;
  /** The pointer's offset from the dragged box's top-left corner. */
  grab: Point;
  /** The box a float lands as. */
  size: { width: number; height: number };
}

/** Everything the overlay draws for one pointer position. */
interface DragView {
  pointer: Point;
  label: string;
  zones: DropZone[];
  hot: DropZone | null;
  preview: Rect | null;
  /** The float has no room; the preview is drawn as refused. */
  refused: boolean;
  /** Swap mode: the pane under the pointer. */
  swapKey: string | null;
  /** The pointer is past the window's edge; a release pops the widget out. */
  outside: boolean;
  /** The pointer is past the edge but this widget has no window of its own, so it stays. */
  stays: boolean;
  /** This widget may leave for its own window at all. */
  canPopOut: boolean;
  swap: boolean;
  overlay: boolean;
  /** A floating widget follows the pointer live. */
  floatingRect: Rect | null;
}

/** What the layout looks like right now, read fresh on every pointer event. */
interface DragContext {
  laid: LaidOut | null;
  layout: WidgetLayout;
  gameRect: Rect | null;
  stage: Rect;
  modifiers: DragModifiers;
  labelOf: (id: WidgetId) => string;
  /** Whether a widget may leave for its own window; every widget may when absent. */
  canPopOut?: (id: WidgetId) => boolean;
}

export type { DragContext, DragSource, DragView, Point };
