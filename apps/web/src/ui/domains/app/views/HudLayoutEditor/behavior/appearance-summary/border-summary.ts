/* @layer renderer-components @kind logic */
import { summaryNumber } from './summary-number';
import type { HudBorder } from '@shared/types/hud';

const borderSummary = (border: HudBorder | undefined): string => {
  if (!border) return 'off';
  const sides = border.sides;
  const off = sides ? (['top', 'right', 'bottom', 'left'] as const).filter((s) => sides[s] === false) : [];
  const drawn = off.length > 0 ? `, no ${off.join('/')}` : '';
  return `${summaryNumber(border.width)}px ${border.style ?? 'solid'}${drawn}`;
};

export { borderSummary };
