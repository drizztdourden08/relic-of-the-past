/* @layer renderer-components @kind logic */
import type { Paint } from '@rotp/hud';

const paintText = (paint: Paint | undefined): string => {
  if (paint === undefined) return 'none';
  if (typeof paint === 'string') return paint;
  return 'gradient' in paint ? paint.gradient : (paint.image || 'image');
};

export { paintText };
