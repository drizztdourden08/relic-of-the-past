/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const trackText = (extent: Extent): string => {
  if (extent === 'auto' || extent === 'fill') return extent;
  if ('from' in extent) return 'ƒx';
  const raw = 'pct' in extent ? extent.pct : extent.px;
  if (typeof raw !== 'number') return 'ƒx';
  return 'pct' in extent ? `${raw}%` : `${raw}px`;
};

export { trackText };
