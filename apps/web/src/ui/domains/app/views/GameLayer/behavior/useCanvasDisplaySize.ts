/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import type React from 'react';
import type { DisplaySize } from '../GameLayer.type';

const useCanvasDisplaySize = (
  canvasRefs: readonly React.RefObject<HTMLCanvasElement | null>[],
  fitSize: DisplaySize,
  status: string,
): void => {
  useEffect(() => {
    const applyStyles = () => {
      for (const ref of canvasRefs) {
        const canvas = ref.current;
        if (!canvas) continue;
        canvas.style.width = `${fitSize.width}px`;
        canvas.style.height = `${fitSize.height}px`;
      }
    };
    applyStyles();
    if (status === 'running') {
      const id = requestAnimationFrame(applyStyles);
      return () => cancelAnimationFrame(id);
    }
  }, [fitSize, status]);
};

export { useCanvasDisplaySize };
