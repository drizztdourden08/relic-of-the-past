/* @layer renderer-components @kind logic */
import type { Paint } from '@rotp/hud';
import type { Translate } from '../translate.type';

const paintText = (paint: Paint | undefined, t: Translate): string => {
  if (paint === undefined) return t('hud-editing:summary.none');
  if (typeof paint === 'string') return paint;
  return 'gradient' in paint ? paint.gradient : (paint.image || 'image');
};

export { paintText };
