/* @layer renderer-hud @kind hook */
/**
 * The overlay's canvas in game pixels: its height is the core's native height (224, 240, or the
 * tall view's), its width follows the container at the same scale, and the 256x224 frame sits
 * centred with the rows a tall view adds above it. Re-measured on resize.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FRAME_H, FRAME_W, HORIZON_Y } from '@shared/game/title/title-layout';
import { wasmGetViewportInfo } from '@app/lib/game/wasm-bridge';
import { linesAbovePicture } from '@app/lib/game/bridge/view-origin';
import type { SceneGeometry } from '../../../scene/scene.type';

const useTitleGeometry = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<SceneGeometry | null>(null);
  const [scale, setScale] = useState(2);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    // The game canvas buffer is twice the native height: 448 for 224 lines, 480 for the 240-line mode.
    const height = canvas ? Math.round(canvas.height / 2) : FRAME_H;
    const scale = h / height;
    setScale(scale);
    const width = Math.max(FRAME_W, Math.round(w / scale));
    const frameY = linesAbovePicture(height, wasmGetViewportInfo()?.extraTopBottom ?? undefined);
    const frameX = Math.round((width - FRAME_W) / 2);
    setGeometry((prev) => {
      const next = { width, height, frameX, frameY, horizonY: frameY + HORIZON_Y };
      const same = prev && prev.width === next.width && prev.height === next.height && prev.frameX === next.frameX && prev.frameY === next.frameY;
      return same ? prev : next;
    });
  }, []);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, geometry, scale };
};

export { useTitleGeometry };
