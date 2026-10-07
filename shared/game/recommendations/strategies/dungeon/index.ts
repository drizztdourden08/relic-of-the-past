/* @layer shared-game @kind barrel */
/**
 * Importing this barrel is what installs the `dungeon` comparison strategy. It
 * mirrors how `strategies/screen`'s barrel installs that strategy as a side
 * effect of import. `strategy-detectors.ts` turns a registered strategy into
 * a runnable detector; import that AFTER this one.
 */
import { registerStrategy } from '../../compare';
import { dungeonStrategy } from './dungeon.strategy';

registerStrategy(dungeonStrategy);

export { dungeonStrategy } from './dungeon.strategy';
