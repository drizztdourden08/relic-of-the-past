/* @layer renderer-hud @kind logic */
import { OUTLINE_DIRECTIONS, OUTLINE_MAX_WIDTH } from './hud-node-style.constants';

const outlineFilter = (widthPx: number, color: string): string => {
  const width = Math.min(OUTLINE_MAX_WIDTH, Math.max(0, widthPx));
  if (width <= 0) return '';
  return Array.from({ length: OUTLINE_DIRECTIONS }, (_unused, i) => {
    const angle = (i / OUTLINE_DIRECTIONS) * Math.PI * 2;
    const dx = (Math.cos(angle) * width).toFixed(2);
    const dy = (Math.sin(angle) * width).toFixed(2);
    return `drop-shadow(${dx}px ${dy}px 0 ${color})`;
  }).join(' ');
};

export { outlineFilter };
