/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FRAME_H, FRAME_W, HORIZON_Y } from '@rotp/game-data';
import type { SceneGeometry } from '../../../title/scene/scene.type';
import type { BackdropGeometry } from '../SceneBackdrop.type';

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
