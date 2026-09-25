/* @layer renderer-components @kind hook */
/**
 * Dragging the seam between two headers: a thin, table-specific wrapper over
 * the design system's own `useResize` (`@ds/primitives/ResizeHandle`), which
 * was lifted out of this hook. Everything about the GESTURE (pointer events
 * over the HTML5 drag API, `setPointerCapture`, preview-then-commit) lives
 * there; this file only supplies what is specific to a COLUMN: its path, its
 * width bounds, and routing the shared hook's bare `width` into the
 * two-argument `(path, width)` callbacks every other column action uses.
 *
 * The header cell around this handle IS an HTML5 drag source, so the two
 * gestures still have to stay apart: `useResize`'s own `preventDefault` on
 * pointer-down keeps a seam pull from starting a native drag, and `resizing`
 * lets the cell drop its `draggable` flag for the length of the drag.
 */
import { useResize } from '@ds/primitives/ResizeHandle';
import { MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from './column-width-math';
import type { RefObject } from 'react';
import type { ColumnResizeBinding } from '../DataTable.type';

interface UseColumnResizeInput {
  path: string;
  /** The header cell this seam sizes. The starting width is measured from it. */
  cellRef: RefObject<HTMLElement | null>;
  /** Shown for the length of the drag, committed to state at the end of it. */
  onPreview: (path: string, width: number) => void;
  onResize: (path: string, width: number) => void;
}

const useColumnResize = (input: UseColumnResizeInput): ColumnResizeBinding => {
  const {
    path, cellRef, onPreview, onResize,
  } = input;
  return useResize({
    sizeRef: cellRef,
    axis: 'horizontal',
    min: MIN_COLUMN_WIDTH,
    max: MAX_COLUMN_WIDTH,
    onPreview: (width) => onPreview(path, width),
    onResize: (width) => onResize(path, width),
  });
};

export { useColumnResize };
export type { UseColumnResizeInput };
