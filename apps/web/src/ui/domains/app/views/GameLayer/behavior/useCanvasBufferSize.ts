/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type React from 'react';
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

  return { bufSize, setBufSize };
};

export { useCanvasBufferSize };
