/* @layer renderer-hud @kind hook */
import { useCallback, useState } from 'react';
import { FRAME_H, FRAME_W, HORIZON_Y } from '@rotp/game-data';
import { wasmGetViewportInfo, linesAbovePicture } from '@rotp/game-core';
import { canvasNativeHeight } from '../../../hooks/canvas-native-height';
import { useResizeMeasure } from '../../../hooks/useResizeMeasure';
import type { SceneGeometry } from '../../../title/scene/scene.type';
import { GAME_CANVAS_ROWS_PER_LINE } from '../TitleView.constants';

const useTitleGeometry = () => {
  const [geometry, setGeometry] = useState<SceneGeometry | null>(null);
  const [scale, setScale] = useState(2);

  const measure = useCallback((el: HTMLDivElement) => {
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;
    const height = Math.round(canvasNativeHeight(FRAME_H, GAME_CANVAS_ROWS_PER_LINE));
    const scale = h / height;
    setScale(scale);
    const width = Math.max(FRAME_W, Math.round(w / scale));
    const frameY = linesAbovePicture(height, wasmGetViewportInfo()?.extraTopBottom ?? undefined);
    const frameX = Math.round((width - FRAME_W) / 2);
    setGeometry((prev) => {
      const next = { width, height, frameX, frameY, horizonY: frameY + HORIZON_Y };
      const same = prev?.width === next.width && prev.height === next.height && prev.frameX === next.frameX && prev.frameY === next.frameY;
      return same ? prev : next;
    });
  }, []);

  const containerRef = useResizeMeasure(measure);

  return { containerRef, geometry, scale };
};

export { useTitleGeometry };
