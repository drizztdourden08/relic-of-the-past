/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MENU_H } from '../PauseMenuView.constants';
import type { MenuScale } from '../PauseMenuView.type';

const useMenuScale = (): MenuScale => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const computeLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const nativeH = canvas ? canvas.height / 2 : MENU_H;

    setScale(h / nativeH);
  }, []);

  useEffect(() => {
    computeLayout();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => computeLayout());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeLayout]);

  return { containerRef, scale };
};

export { useMenuScale };
