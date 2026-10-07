/* @layer renderer-hud @kind hook */
/**
 * The backdrop's canvas in game pixels for the box it fills: a whole-number scale, the smallest
 * that lets the 224-row frame cover the box's height, so the tiles stay pixel-sharp; the canvas
 * then covers the box at that scale, and the water line sits at a fraction of the height. The
 * 256x224 frame's place follows from the water line, which is what the castle's row is measured
 * from. Re-measured on resize.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FRAME_H, FRAME_W, HORIZON_Y } from '@shared/game/title/title-layout';
import type { SceneGeometry } from '../../../scene/scene.type';

interface BackdropGeometry {
  geometry: SceneGeometry;
  scale: number;
}

const sameGeometry = (a: SceneGeometry, b: SceneGeometry): boolean =>
  a.width === b.width && a.height === b.height && a.frameX === b.frameX && a.frameY === b.frameY && a.horizonY === b.horizonY;

const useBackdropGeometry = (horizon: number, scaleOverride?: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<BackdropGeometry | null>(null);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w <= 0 || h <= 0) return;
    const scale = scaleOverride ?? Math.max(1, Math.ceil(h / FRAME_H));
    const width = Math.ceil(w / scale);
    const height = Math.ceil(h / scale);
    const horizonY = Math.round(height * horizon);
    const geometry: SceneGeometry = { width, height, frameX: Math.round((width - FRAME_W) / 2), frameY: horizonY - HORIZON_Y, horizonY };
    setMeasured((prev) => (prev && prev.scale === scale && sameGeometry(prev.geometry, geometry) ? prev : { geometry, scale }));
  }, [horizon, scaleOverride]);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, measured };
};

export { useBackdropGeometry };
export type { BackdropGeometry };
