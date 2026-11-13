/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type React from 'react';
import { GAME_VIEW_RESIZED_EVENT } from '@app/hooks/live-aspect.constants';
import { DEFAULT_BUFFER_SIZE } from '../GameLayer.constants';
import type { BufferSize } from '../GameLayer.type';

const useCanvasBufferSize = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  status: string,
  canvasKey: number,
) => {
  const [bufSize, setBufSize] = useState<BufferSize>(DEFAULT_BUFFER_SIZE);

  useEffect(() => {
    if (status !== 'running') return;
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas && (canvas.width !== bufSize.w || canvas.height !== bufSize.h)) {
        setBufSize({ w: canvas.width, h: canvas.height });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [status, canvasKey]);

  useEffect(() => {
    const onResized = (): void => {
      const canvas = canvasRef.current;
      if (canvas) setBufSize({ w: canvas.width, h: canvas.height });
    };
    window.addEventListener(GAME_VIEW_RESIZED_EVENT, onResized);
    return () => window.removeEventListener(GAME_VIEW_RESIZED_EVENT, onResized);
  }, [canvasRef]);

  return { bufSize, setBufSize };
};

export { useCanvasBufferSize };
