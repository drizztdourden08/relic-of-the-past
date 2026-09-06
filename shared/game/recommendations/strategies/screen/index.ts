/* @layer shared-game @kind barrel */
/**
 * Importing this barrel is what installs the `screen` comparison strategy. It
 * mirrors how `detectors/index.ts` installs a hand-written detector as a side
 * effect of import. `strategy-detectors.ts` is what turns a registered
 * strategy into a runnable detector; import that AFTER this one.
 */
import { registerStrategy } from '../../compare';
import { screenStrategy } from './screen.strategy';

registerStrategy(screenStrategy);

export { screenStrategy } from './screen.strategy';
