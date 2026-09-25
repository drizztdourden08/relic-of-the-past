/* @layer renderer-components @kind hook */
/**
 * Dragging a seam to resize whatever sits beside it, on pointer events instead
 * of the HTML5 drag API. This is the same reasoning `DataTable`'s own column-resize
 * pattern was built on (`composites/DataTable/behavior/use-column-resize.ts`):
 * that API exists to carry a thing to a drop target, firing a coarse,
 * throttled stream with a mandatory drag image and a destination. A resize is
 * the opposite gesture, a continuous delta with neither payload nor
 * destination, which is what `setPointerCapture` is for. The pointer keeps
 * reporting here even once it has left the handle, so the drag survives a
 * fast pull.
 *
 * THE DRAG NEVER TOUCHES STATE ITSELF. It calls `onPreview` on every move
 * (meant to be a direct DOM write: a style property, or the single
 * custom-property write `DataTable` uses when many rows share one seam), and
 * calls `onResize` once, on release, with the size the drag ended at. A press
 * that never moved calls neither.
 */
import { useCallback, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';

interface UseResizeInput {
  /** The element being resized. Its current size is where the drag starts from. */
  sizeRef: RefObject<HTMLElement | null>;
  /** 'horizontal' drags a width off `clientX`; 'vertical' drags a height off `clientY`. */
  axis: 'horizontal' | 'vertical';
  /** The handle sits on the far edge from where the size is measured, so
   *  dragging away from the element should SHRINK it instead of growing it,
   *  as for a panel resized from its own left edge. */
  invert?: boolean;
  min: number;
  max: number;
  /** Shown for the length of the drag; never committed to state itself. */
  onPreview: (size: number) => void;
  onResize: (size: number) => void;
}

interface ResizeBinding {
  resizing: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
}

interface DragState {
  startPos: number;
  startSize: number;
  /** The last size previewed, which is the one release commits. */
  size: number;
}

const clampSize = (size: number, min: number, max: number): number =>
  Math.round(Math.min(Math.max(size, min), max));

const useResize = (input: UseResizeInput): ResizeBinding => {
  const {
    sizeRef, axis, invert = false, min, max, onPreview, onResize,
  } = input;
  const [resizing, setResizing] = useState(false);
  /* A ref, not state: the drag reads and writes it every move and renders on neither. */
  const origin = useRef<DragState | null>(null);

  const posOf = useCallback(
    (event: PointerEvent<HTMLElement>) => (axis === 'horizontal' ? event.clientX : event.clientY),
    [axis],
  );

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const element = sizeRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const startSize = axis === 'horizontal' ? rect.width : rect.height;
    origin.current = { startPos: posOf(event), startSize, size: startSize };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setResizing(true);
  }, [axis, posOf, sizeRef]);

  const onPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = origin.current;
    if (!drag) return;
    event.stopPropagation();
    origin.current = null;
    setResizing(false);
    const handle = event.currentTarget;
    if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    if (drag.size !== drag.startSize) onResize(drag.size);
  }, [onResize]);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = origin.current;
    if (!drag) return;
    event.stopPropagation();
    /* A release the capture never reported still has to end the drag. */
    if (event.buttons === 0) { onPointerUp(event); return; }
    const rawDelta = posOf(event) - drag.startPos;
    drag.size = clampSize(drag.startSize + (invert ? -rawDelta : rawDelta), min, max);
    onPreview(drag.size);
  }, [invert, max, min, onPointerUp, onPreview, posOf]);

  return {
    resizing, onPointerDown, onPointerMove, onPointerUp,
  };
};

export { useResize };
export type { ResizeBinding, UseResizeInput };
