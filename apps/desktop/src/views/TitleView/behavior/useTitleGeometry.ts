/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FRAME_H, FRAME_W, HORIZON_Y } from '@rotp/game-data';
import { wasmGetViewportInfo } from '@rotp/game-core';
import { linesAbovePicture } from '@rotp/game-core';
import type { SceneGeometry } from '../../../title/scene/scene.type';
import { GAME_CANVAS_ROWS_PER_LINE } from '../TitleView.constants';

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
    const height = canvas ? Math.round(canvas.height / GAME_CANVAS_ROWS_PER_LINE) : FRAME_H;
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
