/* @layer renderer-components @kind hook */
/**
 * Dragging one divider of a split. Every pointer move emits the travel since
 * the previous move as a fraction of the split's length, so the host adds it
 * to the two sizes around the divider each time. A double-click evens them.
 */
import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LayoutEdit } from '../DockLayout.type';
import type { DividerRect } from './layout-tree';

const useDividerDrag = (divider: DividerRect, onEdit: (edit: LayoutEdit) => void) => {
  const { node, index, along } = divider;
  const [dragging, setDragging] = useState(false);
  const last = useRef(0);

  const readAxis = useCallback(
    (e: { clientX: number; clientY: number }): number => (node.axis === 'row' ? e.clientX : e.clientY),
    [node.axis],
  );

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = readAxis(e);
    setDragging(true);
  }, [readAxis]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragging || along <= 0) return;
    const at = readAxis(e);
    const delta = (at - last.current) / along;
    last.current = at;
    if (delta !== 0) onEdit({ type: 'resize', node, index, delta });
  }, [dragging, along, readAxis, onEdit, node, index]);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  const onDoubleClick = useCallback(() => onEdit({ type: 'even', node, index }), [onEdit, node, index]);

  return { dragging, onPointerDown, onPointerMove, onPointerUp, onDoubleClick };
};

export { useDividerDrag };
