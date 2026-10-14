/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const rawOf = (value: Exclude<Extent, string>): unknown => {
  if ('pct' in value) return value.pct;
  if ('px' in value) return value.px;
  return undefined;
};

const extentNumberOf = (value: Extent | undefined): number | undefined => {
  if (typeof value !== 'object') return undefined;
  const raw = rawOf(value);
  return typeof raw === 'number' ? raw : undefined;
};

export { extentNumberOf };
