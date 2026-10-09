/* @layer renderer-hud @kind logic */
import type { CSSProperties } from 'react';

const promptTextStyle = (height: number, ink: string, stroke: string): CSSProperties => {
  const edge = Math.max(1, Math.round(height / 12));
  return {
    fontFamily: 'var(--font-game)',
    fontSize: height,
    lineHeight: `${height}px`,
    color: ink,
    WebkitTextStroke: `${edge}px ${stroke}`,
    paintOrder: 'stroke fill',
    textShadow: `${edge}px 0 0 ${stroke}, -${edge}px 0 0 ${stroke}, 0 ${edge}px 0 ${stroke}, 0 -${edge}px 0 ${stroke}`,
    whiteSpace: 'pre',
  };
};

export { promptTextStyle };
