/* @layer renderer-widgets @kind hook */
import { useCallback, useState } from 'react';
import { useResizeMeasure } from '../../../hooks/useResizeMeasure';
import { SCALE_MAX, SCALE_MIN, SCALE_STEP, SNES_TILE } from '../CheatsWidget.constants';

const scaleFor = (width: number, tilesWide: number): number => {
  const raw = width / (tilesWide * SNES_TILE);
  const stepped = Math.floor(raw / SCALE_STEP) * SCALE_STEP;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, stepped));
};

const useConsoleScale = (tilesWide: number) => {
  const [scale, setScale] = useState(1);

  const measure = useCallback((el: HTMLDivElement) => {
    if (el.clientWidth <= 0) return;
    setScale(scaleFor(el.clientWidth, tilesWide));
  }, [tilesWide]);

  const ref = useResizeMeasure(measure);

  return { ref, scale };
};

export { useConsoleScale };
