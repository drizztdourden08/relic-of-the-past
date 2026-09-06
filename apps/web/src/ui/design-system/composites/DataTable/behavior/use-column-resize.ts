/* @layer renderer-components @kind hook */
/**
 * Seam drag on pointer events, not the HTML5 drag API: a resize is a continuous
 * delta with no payload, and `setPointerCapture` keeps the pointer reporting
 * here after it leaves the element. The header cell around this handle is an
 * HTML5 drag source, so every pointer event stops bubbling and `resizing` lets
 * the cell drop `draggable`. The drag previews via one custom-property write
 * and commits on pointer up; state per move would re-render every row.
 */
import { useCallback, useRef, useState } from 'react';
import { widthFromDrag } from './column-width-math';
import type { PointerEvent, RefObject } from 'react';
import type { ColumnResizeBinding } from '../DataTable.type';

interface UseColumnResizeInput {
  path: string;
  /** The header cell this seam sizes. The starting width is measured from it. */
  cellRef: RefObject<HTMLElement | null>;
  /** Shown for the length of the drag, committed to state at the end of it. */
  onPreview: (path: string, width: number) => void;
  onResize: (path: string, width: number) => void;
}

interface DragState {
  startX: number;
  startWidth: number;
  /** The last width previewed, which is the one the release commits. */
  width: number;
}

const useColumnResize = (input: UseColumnResizeInput): ColumnResizeBinding => {
  const { path, cellRef, onPreview, onResize } = input;
  const [resizing, setResizing] = useState(false);
  /* A ref, not state: the drag reads and writes it on every move and renders on neither. */
  const origin = useRef<DragState | null>(null);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
    /* Keeps the surrounding cell from starting a native drag off the same press. */
    event.preventDefault();
    const cell = cellRef.current;
    if (!cell) return;
    const startWidth = cell.getBoundingClientRect().width;
    origin.current = { startX: event.clientX, startWidth, width: startWidth };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setResizing(true);
  }, [cellRef]);

  const onPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = origin.current;
    if (!drag) return;
    event.stopPropagation();
    origin.current = null;
    setResizing(false);
    const handle = event.currentTarget;
    if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    /* The one state write of the gesture. A press that never moved writes
       nothing, so clicking a seam does not pin an automatic column. */
    if (drag.width !== drag.startWidth) onResize(path, drag.width);
  }, [onResize, path]);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = origin.current;
    if (!drag) return;
    event.stopPropagation();
    /* A release the capture never reported still has to end the drag. */
    if (event.buttons === 0) {
      onPointerUp(event);
      return;
    }
    drag.width = widthFromDrag({ ...drag, clientX: event.clientX });
    onPreview(path, drag.width);
  }, [onPointerUp, onPreview, path]);

  return { resizing, onPointerDown, onPointerMove, onPointerUp };
};

export { useColumnResize };
export type { UseColumnResizeInput };
