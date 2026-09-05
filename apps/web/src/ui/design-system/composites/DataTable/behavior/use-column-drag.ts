/* @layer renderer-components @kind hook */
/**
 * Column reordering on native drag events; no dnd dependency. The hook owns
 * only transient drag chrome; the reorder itself is the headless hook's.
 *
 * Two tiers answer the drag: a cell names its own index, and the surface behind
 * the cells catches everything else and lands it where the preview said. The
 * surface tier is required: the gap the columns open is bare grid, and a
 * release over ground that accepts no drop is cancelled by the browser.
 */
import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';
import type { ColumnDragBinding, ColumnDragStart } from '../DataTable.type';

const DRAG_MIME = 'text/plain';

/** Where the cursor holds the ghost: by its header bar, so a tall strip reads as lifted. */
const grabPoint = (ghost: HTMLElement): { x: number; y: number } => {
  const head = ghost.firstElementChild;
  const centred = ghost.offsetHeight / 2;
  const y = head instanceof HTMLElement ? head.offsetTop + head.offsetHeight / 2 : centred;
  return { x: ghost.offsetWidth / 2, y };
};

/** Says "a column may land here", which is what keeps a drop alive. */
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

  /* Bound to dragenter and dragover: a cursor that has not moved gets no dragover. */
  const onSurfaceHover = useCallback((event: DragEvent<HTMLElement>) => {
    /* Silent about which column: the hovered index must not move. */
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
