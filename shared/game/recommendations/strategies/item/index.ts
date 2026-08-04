/* @layer shared-game @kind barrel */
/**
 * Importing this barrel is what installs the `item` comparison strategy —
 * mirrors how `strategies/screen`'s barrel installs that strategy as a side
 * effect of import. `strategy-detectors.ts` turns a registered strategy into
 * a runnable detector; import that AFTER this one.
 */
import { registerStrategy } from '../../compare';
import { itemStrategy } from './item.strategy';

registerStrategy(itemStrategy);

export { itemStrategy } from './item.strategy';
