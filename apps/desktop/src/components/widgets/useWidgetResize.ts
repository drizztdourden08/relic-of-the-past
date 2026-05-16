/**
 * useWidgetResize — Hook for resizing floating widgets from edges/corners.
 * For docked widgets, only the "thickness" edge is resizable.
 */
import { useRef, useCallback } from 'react';
import type { SnapSide } from './widget-types';

interface Size {
  width: number;
  height: number;
}

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 120;

export function useWidgetResize(
  size: Size,
  pos: { x: number; y: number },
  onResize: (width: number, height: number, x: number, y: number) => void,
) {
  const resizing = useRef(false);
  const startRef = useRef({ mx: 0, my: 0, w: 0, h: 0, x: 0, y: 0, edge: '' as Edge });

  const onEdgeMouseDown = useCallback(
    (edge: Edge) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizing.current = true;
      startRef.current = {
        mx: e.clientX,
        my: e.clientY,
        w: size.width,
        h: size.height,
        x: pos.x,
        y: pos.y,
        edge,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        const s = startRef.current;
        const dx = ev.clientX - s.mx;
        const dy = ev.clientY - s.my;

        let newW = s.w;
        let newH = s.h;
        let newX = s.x;
        let newY = s.y;

        if (s.edge.includes('e')) newW = Math.max(MIN_WIDTH, s.w + dx);
        if (s.edge.includes('w')) { newW = Math.max(MIN_WIDTH, s.w - dx); newX = s.x + (s.w - newW); }
        if (s.edge.includes('s')) newH = Math.max(MIN_HEIGHT, s.h + dy);
        if (s.edge.includes('n')) { newH = Math.max(MIN_HEIGHT, s.h - dy); newY = s.y + (s.h - newH); }

        onResize(newW, newH, newX, newY);
      };

      const onMouseUp = () => {
        resizing.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [size.width, size.height, pos.x, pos.y, onResize],
  );

  return { onEdgeMouseDown };
}

/**
 * For docked widgets, only the "thickness" edge is resizable:
 * left-docked → east edge, right-docked → west edge,
 * top-docked → south edge, bottom-docked → north edge.
 */
export function getDockedResizeEdge(side: SnapSide): Edge {
  switch (side) {
    case 'left': return 'e';
    case 'right': return 'w';
    case 'top': return 's';
    case 'bottom': return 'n';
  }
}
