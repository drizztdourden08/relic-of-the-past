/* @layer shared-game @kind barrel */
/**
 * Importing this barrel is what installs the `screen` comparison strategy —
 * mirrors how `detectors/index.ts` installs a hand-written detector as a side
 * effect of import. `strategy-detectors.ts` is what turns a registered
 * strategy into a runnable detector; import that AFTER this one.
 *
 * The geography detector is hand-written rather than strategy-derived (it
 * compares the dataset against itself, not against the game), so it registers
 * itself here directly. It carries its own detector id, so the pass that wires
 * the strategies up cannot overwrite it.
 */
import { registerStrategy } from '../../compare';
import { registerDetector } from '../../registry';
import { screenGeographyDetector } from './geography.detector';
import { screenStrategy } from './screen.strategy';

registerStrategy(screenStrategy);
registerDetector(screenGeographyDetector);

export { screenGeographyDetector } from './geography.detector';
export { screenStrategy } from './screen.strategy';
