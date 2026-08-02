/* @layer renderer-components @kind hook */
/**
 * Column reordering on the browser's own drag events — no dnd dependency. The
 * hook owns nothing but transient drag chrome (which header is moving, where it
 * started, which gap is under the cursor); the reorder itself is the headless
 * hook's.
 *
 * `ghost` is the strip the header cell parks offscreen for exactly this moment:
 * handed to `setDragImage`, it replaces Chromium's screenshot of the whole
 * header cell — caret, ⋯ button and all — with the column itself, name over
 * values. Passing none is legal and simply leaves the browser default in place.
 *
 * Two tiers answer the drag, in the order a chain of responsibility answers
 * anything: a CELL is the precise answer and names its own index, and the
 * SURFACE behind the cells is the fallback that catches everything else and
 * lands it wherever the preview already said it would go. The fallback is not
 * a nicety — the columns step aside to open the gap the carried one will drop
 * into, and that gap is bare grid. A cursor held still over a column for longer
 * than the step takes ends up standing in it, and a release over ground that
 * accepts no drop is a release the browser cancels outright: `dragend` fires,
 * `drop` never does, and the column snaps back.
 */
import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';
import type { ColumnDragBinding, ColumnDragStart } from '../DataTable.type';

const DRAG_MIME = 'text/plain';

/**
 * Where the cursor holds the ghost. The strip's first child is its own header
 * bar, and holding a column by its header is what the gesture started as — held
 * halfway down instead, a tall strip reads as skewered rather than lifted.
 */
const grabPoint = (ghost: HTMLElement): { x: number; y: number } => {
  const head = ghost.firstElementChild;
  const centred = ghost.offsetHeight / 2;
  const y = head instanceof HTMLElement ? head.offsetTop + head.offsetHeight / 2 : centred;
  return { x: ghost.offsetWidth / 2, y };
};

/** Says "yes, a column may land here" — the one thing that keeps a drop alive. */
const accept = (event: DragEvent<HTMLElement>): void => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const useColumnDrag = (onReorder: (path: string, to: number) => void): ColumnDragBinding => {
  const [draggingPath, setDraggingPath] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDragStart = useCallback((start: ColumnDragStart) => {
    const { path, index, event, ghost } = start;
    event.dataTransfer.effectAllowed = 'move';
    /* Chromium refuses to start a drag unless some data is set on it. */
    event.dataTransfer.setData(DRAG_MIME, path);
    if (ghost) {
      const { x, y } = grabPoint(ghost);
      event.dataTransfer.setDragImage(ghost, x, y);
    }
    setDraggingPath(path);
    setDraggingIndex(index);
    /* Its own slot, so nothing displaces until the cursor has actually moved. */
    setOverIndex(index);
  }, []);

  const onDragOver = useCallback((index: number, event: DragEvent<HTMLElement>) => {
    accept(event);
    setOverIndex(index);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggingPath(null);
    setDraggingIndex(null);
    setOverIndex(null);
  }, []);

  const commit = useCallback((to: number, event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const path = draggingPath ?? event.dataTransfer.getData(DRAG_MIME);
    if (path && to >= 0) onReorder(path, to);
    onDragEnd();
  }, [draggingPath, onReorder, onDragEnd]);

  const onDrop = useCallback((index: number, event: DragEvent<HTMLElement>) => {
    /* The cell has the precise answer, so the surface behind it must not answer too. */
    event.stopPropagation();
    commit(index, event);
  }, [commit]);

  /*
   * Bound to dragenter as well as dragover, and that is the half that matters
   * here: a cursor that has not moved gets no dragover at all, and the only
   * thing the browser asks before a release over new ground is dragenter.
   */
  const onSurfaceHover = useCallback((event: DragEvent<HTMLElement>) => {
    /* Deliberately silent about WHICH column — the gap under the cursor is the
       slot the preview already opened, so the hovered index must not move. */
    accept(event);
  }, []);

  const onSurfaceDrop = useCallback((event: DragEvent<HTMLElement>) => {
    commit(overIndex ?? -1, event);
  }, [commit, overIndex]);

  return {
    draggingPath, draggingIndex, overIndex,
    onDragStart, onDragOver, onDrop, onDragEnd, onSurfaceHover, onSurfaceDrop,
  };
};

export { useColumnDrag };
