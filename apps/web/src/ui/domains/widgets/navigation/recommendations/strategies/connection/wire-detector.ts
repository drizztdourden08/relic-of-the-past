/* @layer renderer-widgets @kind logic */
/**
 * Registers the `connection` strategy's detector WITH its `onUnresolvable`
 * mapper (F2) — separately from `strategy-detectors.ts`'s generic pass, which
 * calls `detectorFromStrategy(strategy)` for every registered strategy with
 * NO second argument, and would silently drop every unresolved crossing if
 * this file's registration lost the race.
 *
 * `detectorFromStrategy` always mints the same id (`strategy:${kind}`), and
 * `registerDetector` keys on id — last write wins. So THIS import must run
 * AFTER `@shared/game/recommendations/strategy-detectors` (see
 * `use-detection-pass.ts`'s import order), not alongside
 * `strategies/connection`'s own barrel (`index.ts`), which has to run
 * BEFORE `strategy-detectors` so `registerStrategy(connectionStrategy)` has
 * already happened by the time the generic pass reads `allStrategies()`.
 */
import { registerDetector } from '@shared/game/recommendations';
import { detectorFromStrategy } from '@shared/game/recommendations/compare';
import { connectionStrategy } from './connection.strategy';
import { onUnresolvableConnection } from './unresolvable-screen';

registerDetector(detectorFromStrategy(connectionStrategy, onUnresolvableConnection));
