/* @layer shared-game @kind barrel */
/**
 * Importing this barrel is what installs the `check` comparison strategy. It
 * mirrors how `strategies/screen`'s barrel installs that strategy as a side
 * effect of import. `strategy-detectors.ts` turns a registered strategy into
 * a runnable detector; import that AFTER this one.
 */
import { registerStrategy } from '../../compare';
import { checkStrategy } from './check.strategy';

registerStrategy(checkStrategy);

export { checkStrategy } from './check.strategy';
