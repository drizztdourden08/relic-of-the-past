/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';

const numberOf = (value: Extent | undefined): number => {
  if (typeof value !== 'object') return 0;
  const raw = 'pct' in value ? value.pct : 'px' in value ? value.px : undefined;
  return typeof raw === 'number' ? raw : 0;
};

export { numberOf };
