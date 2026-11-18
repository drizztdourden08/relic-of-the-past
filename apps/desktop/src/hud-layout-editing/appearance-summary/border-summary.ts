/* @layer renderer-components @kind logic */
import { summaryNumber } from './summary-number';
import type { HudBorder } from '@rotp/hud';
import type { Translate } from '../translate.type';

const borderSummary = (border: HudBorder | undefined, t: Translate): string => {
  if (!border) return t('hud-editing:summary.off');
  const sides = border.sides;
  const off = sides ? (['top', 'right', 'bottom', 'left'] as const).filter((s) => sides[s] === false) : [];
  const drawn = off.length > 0 ? `, ${t('hud-editing:summary.no-sides', { sides: off.join('/') })}` : '';
  return `${summaryNumber(border.width)}px ${border.style ?? 'solid'}${drawn}`;
};

export { borderSummary };
