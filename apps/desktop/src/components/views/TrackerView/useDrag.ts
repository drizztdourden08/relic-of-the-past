import { useCallback, useRef } from 'react';

function useDrag(pos: { x: number; y: number }, onMove: (x: number, y: number) => void) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((e: React.MouseEvent) => {
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
  }, [pos.x, pos.y, onMove]);

  return startDrag;
}

export { useDrag };
