/* @layer renderer-components @kind logic */
import type { PoolImpacts } from '@app/hooks/randomizer/use-pool-impacts.type';

const poolEndLabel = (accounting: PoolImpacts['accounting']): string =>
  (accounting === null ? 'item pool' : `item pool · ${accounting.items} items`);

export { poolEndLabel };
