/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SCREEN_H, SCREEN_W } from '@shared/game/dialog/box-geometry';
import { wasmGetViewportInfo } from '../../../../../../lib/game/wasm-bridge';
import { linesAbovePicture } from '@app/lib/game/bridge/view-origin';
import { INITIAL_DIALOG_SCALE, SCANLINE_LEAD } from '../DialogView.constants';
import type { DialogScale } from '../DialogView.type';

const linesAbove = (nativeH: number): number =>
  linesAbovePicture(nativeH, wasmGetViewportInfo()?.extraTopBottom);

const useDialogScale = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<DialogScale>(INITIAL_DIALOG_SCALE);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const nativeH = canvas ? canvas.height / 2 : SCREEN_H;
    const scale = h / nativeH;
    setMetrics({
      height: h,
      scale,
      offsetX: (w - SCREEN_W * scale) / 2,
      offsetY: (linesAbove(nativeH) - SCANLINE_LEAD) * scale,
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

  return { containerRef, ...metrics };
};

export { useDialogScale };
