/* @layer renderer-widgets @kind component */
import { useCallback } from 'react';
import { Canvas } from '../../../../design-system/primitives';

/** Pixel canvas rendering a flood-fill reachability grid (one px per tile). */
const ReachabilityCanvas = ({ reachable, bounds, tileLayer }: {
  reachable: number[][];
  size: number;
  bounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
  tileLayer?: (0 | 1 | 2)[][];
}) => {
  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const r0 = bounds?.minRow ?? 0, r1 = bounds?.maxRow ?? 63;
    const c0 = bounds?.minCol ?? 0, c1 = bounds?.maxCol ?? 63;
    const rows = r1 - r0 + 1, cols = c1 - c0 + 1;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(cols, rows);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const state = reachable[r]?.[c] ?? 0;
        const off = ((r - r0) * cols + (c - c0)) * 4;
        if (state === 1) {
          const layer = tileLayer?.[r]?.[c];
          if (layer === 0) {
            img.data[off] = 105; img.data[off + 1] = 105; img.data[off + 2] = 105; img.data[off + 3] = 255;
          } else if (layer === 1) {
            img.data[off] = 65; img.data[off + 1] = 65; img.data[off + 2] = 65; img.data[off + 3] = 255;
          } else {
            img.data[off] = 90; img.data[off + 1] = 90; img.data[off + 2] = 90; img.data[off + 3] = 255;
          }
        } else if (state >= 2) {
          img.data[off] = 50; img.data[off + 1] = 50; img.data[off + 2] = 50; img.data[off + 3] = 255;
        } else {
          img.data[off] = 18; img.data[off + 1] = 18; img.data[off + 2] = 18; img.data[off + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [reachable, bounds, tileLayer]);

  return <Canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 'var(--r-sm)', imageRendering: 'pixelated' }} />;
};

export { ReachabilityCanvas };
