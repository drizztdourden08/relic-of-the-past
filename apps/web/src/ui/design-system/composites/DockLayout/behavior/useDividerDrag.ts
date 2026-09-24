/* @layer renderer-components @kind hook */
/**
 * Dragging one divider of a split. The press starts it; the window then
 * follows the pointer until it is released, so the drag survives the divider
 * re-rendering as the sizes it changes move it. Every move emits the travel
 * since the previous one as a fraction of the split's length, so the host adds
 * it to the two sizes around the divider each time. A double-click evens them.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LayoutEdit } from '../DockLayout.type';
import type { DividerRect } from './layout-tree';

const useDividerDrag = (divider: DividerRect, onEdit: (edit: LayoutEdit) => void) => {
  const { node, index, along } = divider;
  const [dragging, setDragging] = useState(false);
  const detach = useRef<(() => void) | null>(null);
  const latest = useRef({ node, index, along, onEdit });
  latest.current = { node, index, along, onEdit };

  useEffect(() => () => detach.current?.(), []);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || detach.current) return;
    e.preventDefault();
    e.stopPropagation();
    const axis = latest.current.node.axis;
    const readAxis = (ev: { clientX: number; clientY: number }): number => (axis === 'row' ? ev.clientX : ev.clientY);
    const pointerId = e.pointerId;
    let last = readAxis(e);

    const onMove = (ev: PointerEvent): void => {
      if (ev.pointerId !== pointerId) return;
      const { node: split, index: at, along: length, onEdit: emit } = latest.current;
      if (length <= 0) return;
      const now = readAxis(ev);
      const delta = (now - last) / length;
      last = now;
      if (delta !== 0) emit({ type: 'resize', node: split, index: at, delta });
    };
    const onUp = (ev: PointerEvent): void => {
      if (ev.pointerId !== pointerId) return;
      detach.current?.();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    detach.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      detach.current = null;
      setDragging(false);
    };
    setDragging(true);
  }, []);

  const onDoubleClick = useCallback(() => {
    const { node: split, index: at, onEdit: emit } = latest.current;
    emit({ type: 'even', node: split, index: at });
  }, []);

  return { dragging, onPointerDown, onDoubleClick };
};

export { useDividerDrag };
