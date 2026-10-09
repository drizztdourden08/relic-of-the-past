/* @layer renderer-components @kind logic */
import type { Extent } from '@shared/types/hud';

const extentText = (extent: Extent | undefined): string => {
  if (extent === undefined || extent === 'auto') return 'auto';
  if (extent === 'fill') return 'fill';
  if ('pct' in extent) return typeof extent.pct === 'number' ? `${extent.pct}%` : '% ƒx';
  if ('px' in extent) return typeof extent.px === 'number' ? String(extent.px) : 'ƒx';
  return 'ƒx';
};

export { extentText };
