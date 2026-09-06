/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** Which pane is currently hidden, if either. */
type CollapsedSide = 'none' | 'start' | 'end';

interface SplitPaneProps {
  start: ReactNode;
  end: ReactNode;
  /** Share of the width the START pane opens at, 0..1. */
  defaultRatio?: number;
  /**
   * Drag a pane below this share and it collapses entirely instead of
   * shrinking into uselessness. Dragging back out past it restores the pane.
   */
  snapAt?: number;
  /** The pane hidden on first render, if either; the rail brings it back. */
  defaultCollapsed?: CollapsedSide;
  /** Names used on the divider's tooltip and the restore buttons. */
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

export type { CollapsedSide, SplitPaneProps };
