/* @layer renderer-components @kind logic */
import { CHAR_WIDTH_RATIO, FALLBACK_FONT_PX } from '../PadOverlay.constants';
import type { TextMeasure } from '../PadOverlay.type';

const canvasHolder: { context: CanvasRenderingContext2D | null } = { context: null };

const contextOf = (): CanvasRenderingContext2D | null => {
  canvasHolder.context ??= document.createElement('canvas').getContext('2d');
  return canvasHolder.context;
};

const widthIn = (font: string, fallbackPx: number) => (text: string): number => {
  const context = contextOf();
  if (!context) return text.length * fallbackPx * CHAR_WIDTH_RATIO;
  context.font = font;
  return context.measureText(text).width;
};

const textMeasure = (element: Element): { fontPx: number; measure: TextMeasure } => {
  const style = getComputedStyle(element);
  const fontPx = Number.parseFloat(style.fontSize) || FALLBACK_FONT_PX;
  const weight = style.getPropertyValue('--weight-semi').trim() || style.fontWeight;
  const mono = style.getPropertyValue('--font-mono').trim() || 'monospace';
  return {
    fontPx,
    measure: {
      name: widthIn(`${weight} ${fontPx}px ${style.fontFamily}`, fontPx),
      detail: widthIn(`${fontPx}px ${mono}`, fontPx),
    },
  };
};

export { textMeasure };
