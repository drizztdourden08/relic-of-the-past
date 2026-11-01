/* @layer renderer-hud @kind hook */
import { useCallback, useState } from 'react';
import { canvasNativeHeight } from '../../../hooks/canvas-native-height';
import { useResizeMeasure } from '../../../hooks/useResizeMeasure';
import { MENU_H } from '../PauseMenuView.constants';
import type { MenuScale } from '../PauseMenuView.type';

const useMenuScale = (): MenuScale => {
  const [scale, setScale] = useState(1);

  const computeLayout = useCallback((el: HTMLDivElement) => {
    const h = el.clientHeight;
    if (h <= 0) return;
    setScale(h / canvasNativeHeight(MENU_H));
  }, []);

  const containerRef = useResizeMeasure(computeLayout);

  return { containerRef, scale };
};

export { useMenuScale };
