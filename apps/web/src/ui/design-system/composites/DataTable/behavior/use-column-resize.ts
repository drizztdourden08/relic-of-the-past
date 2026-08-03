/* @layer renderer-components @kind hook */
/**
 * Dragging the seam between two headers, on pointer events rather than the
 * HTML5 drag API. That API exists to carry a thing to a drop target — it fires
 * a coarse, throttled stream, it insists on a drag image, and it ends at a
 * target rather than at a position. A resize is the opposite gesture: it is a
 * continuous delta with no payload and no destination, which is what
 * `setPointerCapture` is for — the pointer keeps reporting to this element even
 * once it has left it, so the drag survives a fast pull across the table.
 *
 * Keeping the two gestures apart matters, because the header cell around this
 * handle IS an HTML5 drag source. Two things stop a seam pull from being read
 * as a column reorder: every pointer event here stops bubbling, and `resizing`
 * lets the cell drop its `draggable` flag for the length of the drag.
 *
 * The drag itself never touches state. It PREVIEWS — one custom-property write
 * that the header and every row follow — and commits the width it ended on when
 * the pointer comes up. A table renders every row it holds, so a setState per
 * mouse move would re-render all of them, repeatedly, mid-gesture.
 */
import { useCallback, useRef, useState } from 'react';
import { widthFromDrag } from './column-width-math';
import type { PointerEvent, RefObject } from 'react';
import type { ColumnResizeBinding } from '../DataTable.type';

interface UseColumnResizeInput {
  path: string;
  /** The header cell this seam sizes — where the starting width is measured. */
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
    /*
     * The preview was never state; this is the one write the whole gesture
     * makes. A press that never moved writes nothing at all — clicking a seam
     * must not quietly pin an automatic column to whatever width it happened
     * to have.
     */
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
