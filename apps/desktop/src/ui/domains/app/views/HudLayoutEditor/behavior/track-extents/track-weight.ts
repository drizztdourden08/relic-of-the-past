/* @layer renderer-components @kind logic */
import type { Extent } from '@shared/types/hud';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const trackWeight = (extent: Extent): number => {
  if (extent === 'auto') return 1;
  if (extent === 'fill') return 2;
  if ('from' in extent) return 1;
  const raw = 'pct' in extent ? extent.pct : extent.px;
  if (typeof raw !== 'number') return 1;
  return clamp('pct' in extent ? raw / 25 : raw / 16, 0.4, 4);
};

export { trackWeight };
