/* @layer renderer-hud @kind logic */
/**
 * Game pixels to CSS pixels for the overlay, the way HudView measures it: the scale comes from the
 * container height against the canvas's native height (which respects the 240-line mode), the 256-px
 * screen sits centred inside a wider canvas, and the picture starts below any lines the view adds on top.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { SCREEN_H, SCREEN_W } from '@shared/game/dialog/box-geometry';
import { wasmGetViewportInfo } from '../../../../../../lib/game/wasm-bridge';

/**
 * Game lines above the 224-line picture. The tall view adds the same budget above and below; the
 * 240-line view adds its 16 lines below only. Without the core's answer, a 16-line surplus is that view.
 */
const linesAbove = (nativeH: number): number => {
  const reported = wasmGetViewportInfo()?.extraTopBottom;
  if (reported !== undefined) return reported;
  const surplus = nativeH - SCREEN_H;
  return surplus === 16 ? 0 : surplus / 2;
};

/**
 * The renderer draws output row r from scanline r + 1, as the hardware does (ppu_runLine skips line 0),
 * so every background tile shows one game pixel above its tile coordinate. The box follows the text.
 */
const SCANLINE_LEAD = 1;

interface DialogScale {
  /** Height of the overlay area in CSS pixels. */
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

const INITIAL: DialogScale = { height: 0, scale: 2, offsetX: 0, offsetY: 0 };

const useDialogScale = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<DialogScale>(INITIAL);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    // The canvas buffer is twice the native height: 448 for 224 lines, 480 for the 240-line mode.
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
export type { DialogScale };
