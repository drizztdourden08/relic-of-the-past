/* @layer shared-game @kind logic */
import { createRng } from '../../../rng';
import { clampSlotCount } from './clamp-count';
import { normalizeEnabled } from './normalize-enabled';
import type { ShopScope } from '../shop-scope.type';

const openedSlotIndicesOf = (scope: ShopScope): readonly number[] => {
  const { mode, slotCount, seed } = scope;
  const enabled = normalizeEnabled(scope.enabled);
  if (mode === 'vanilla') return [];
  if (mode === 'custom') return enabled;
  const wanted = clampSlotCount(slotCount, enabled.length);
  if (mode === 'sequential') return enabled.slice(0, wanted);
  return createRng(`${seed}:shop-slots`).shuffle(enabled).slice(0, wanted).sort((a, b) => a - b);
};

export { openedSlotIndicesOf };
