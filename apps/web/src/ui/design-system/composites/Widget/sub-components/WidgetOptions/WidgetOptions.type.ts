/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** Where a widget lives: on a dock edge, free on the game, or in its own window. */
type WidgetPlacement = 'docked' | 'floating' | 'popped';
/** The edge a docked widget is attached to. */
type DockEdge = 'left' | 'right' | 'top' | 'bottom';
/** When the widget is visible: always, or only while the game runs. */
type WidgetShow = 'always' | 'game-only';

/** A rect in viewport coordinates, the shape getBoundingClientRect hands back. */
interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetOptionsProps {
  /** The widget's display name, shown in the header. */
  title: string;
  /** The current placement, which lights the matching placement button. */
  placement: WidgetPlacement;
  /** The edge lit while docked; ignored otherwise. */
  dockEdge?: DockEdge;
  /** Whether the game shrinks to leave room for this widget while docked. */
  makeRoom: boolean;
  /** Frame opacity, 0..1. */
  opacity: number;
  /** When the widget is visible. */
  show: WidgetShow;
  /** The gear button's rect, in viewport coordinates, the panel positions itself under. */
  anchorRect: AnchorRect;
  /** Dock to an edge. */
  onDock: (edge: DockEdge) => void;
  /** Let the widget float over the game. */
  onFloat: () => void;
  /** Move the widget to its own window. */
  onPopOut: () => void;
  /** False hides the pop-out action. */
  canPopOut?: boolean;
  /** Toggle the game shrinking to fit this widget. */
  onMakeRoomChange: (value: boolean) => void;
  /** New frame opacity, 0..1. */
  onOpacityChange: (value: number) => void;
  /** New visibility rule. */
  onShowChange: (value: WidgetShow) => void;
  /** Put every option of this widget back to its default. */
  onReset: () => void;
  /** Close the panel; fired by the close button, Escape and an outside click. */
  onClose: () => void;
  /** The widget's own OptionRows. */
  children?: ReactNode;
}

interface OptionRowProps {
  /** What the control sets. */
  label: string;
  /** A short line under the label saying what the option does. */
  hint?: string;
  /** The control, drawn on the right. */
  children: ReactNode;
}

export type { AnchorRect, DockEdge, OptionRowProps, WidgetOptionsProps, WidgetPlacement, WidgetShow };
