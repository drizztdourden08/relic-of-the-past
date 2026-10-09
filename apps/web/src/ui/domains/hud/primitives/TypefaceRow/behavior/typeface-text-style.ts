/* @layer renderer-hud @kind logic */
import type { CSSProperties } from 'react';
import { CELL_H } from '../TypefaceRow.constants';

const typefaceTextStyle = (unit: number, ink: string, stroke: string, strokeWidth: number): CSSProperties => {
  const edge = strokeWidth > 0 ? Math.max(1, Math.round(strokeWidth * unit)) : 0;
  return {
    position: 'absolute',
    top: 0,
    height: CELL_H * unit,
    fontFamily: 'var(--font-game)',
    fontSize: CELL_H * unit,
    lineHeight: `${CELL_H * unit}px`,
    color: ink,
    WebkitTextStroke: edge > 0 ? `${edge}px ${stroke}` : undefined,
    paintOrder: 'stroke fill',
    textShadow: edge > 0 ? `${edge}px 0 0 ${stroke}, -${edge}px 0 0 ${stroke}, 0 ${edge}px 0 ${stroke}, 0 -${edge}px 0 ${stroke}` : undefined,
    WebkitFontSmoothing: 'none',
    whiteSpace: 'pre',
    letterSpacing: 0,
  };
};

export { typefaceTextStyle };
