/* @layer renderer-components @kind hook */
/**
 * useWidgetDrag — Hook for dragging floating widgets by their titlebar.
 */
import { useRef, useCallback } from 'react';

interface DragPosition {
  x: number;
  y: number;
}

const useWidgetDrag = (
  pos: DragPosition,
  onMove: (x: number, y: number) => void,
) => {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only left button
      if (e.button !== 0) return;
      e.preventDefault();
      dragging.current = true;
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        onMove(ev.clientX - offset.current.x, ev.clientY - offset.current.y);
      };
      const onMouseUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [pos.x, pos.y, onMove],
  );

  return onMouseDown;
}

export { useWidgetDrag };
