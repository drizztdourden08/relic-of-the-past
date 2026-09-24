/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { DropTarget, FloatingWidget, PaneNode, Rect, SplitNode, WidgetId, WidgetLayout } from '@shared/types/widget-layout';

/** What a drag or a divider asks the host to do to the layout. The host's store applies it. */
type LayoutEdit =
  | { type: 'move-widget'; id: WidgetId; target: Exclude<DropTarget, { at: 'float' }>; makeRoom: boolean }
  | { type: 'float-widget'; id: WidgetId; rect: Rect }
  | { type: 'move-game'; target: Exclude<DropTarget, { at: 'float' } | { at: 'tab' }> }
  | { type: 'swap-panes'; keyA: string; keyB: string }
  | { type: 'resize'; node: SplitNode; index: number; delta: number }
  | { type: 'even'; node: SplitNode; index: number }
  | { type: 'activate-tab'; key: string; id: WidgetId }
  | { type: 'pop-out'; id: WidgetId };

/** Held keys that change what a drag does. */
interface DragModifiers {
  /** Drop on a pane to exchange places with it. */
  swap: boolean;
  /** Land with Make room off. */
  overlay: boolean;
}

interface DockLayoutProps {
  layout: WidgetLayout;
  /** Every docked pane folds to its title strip and the game takes the room. */
  peek: boolean;
  modifiers: DragModifiers;
  /** Draws one docked pane's content inside the rectangle the layout gave it. */
  renderPane: (pane: PaneNode, rect: Rect) => ReactNode;
  /** Draws one floating widget's content inside its rectangle over the game. */
  renderFloating: (floating: FloatingWidget, rect: Rect) => ReactNode;
  /** The play area's rectangle, whenever it changes. */
  onGameRect: (rect: Rect | null) => void;
  onEdit: (edit: LayoutEdit) => void;
  /** Dragging past the window's edge pops the widget out. */
  onPopOut?: (id: WidgetId) => void;
  /** Whether a widget may leave for its own window; every widget may when absent. */
  canPopOut?: (id: WidgetId) => boolean;
  labelOf: (id: WidgetId) => string;
  className?: string;
}

export type { DockLayoutProps, DragModifiers, LayoutEdit };
