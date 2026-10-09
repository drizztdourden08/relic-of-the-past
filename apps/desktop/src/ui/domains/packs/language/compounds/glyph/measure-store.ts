/* @layer renderer-components @kind logic */
import type { GlyphStore } from './glyph.type';

const measureStore = (canvas: HTMLCanvasElement, ratio: number): GlyphStore | null => {
  const box = canvas.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return null;
  return {
    width: Math.max(1, Math.round(box.width * ratio)),
    height: Math.max(1, Math.round(box.height * ratio)),
  };
};

export { measureStore };
