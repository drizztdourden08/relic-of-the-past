/* @layer shared-game @kind logic */
/**
 * Turns every currently registered comparison strategy into a registered
 * detector, via `detectorFromStrategy`. That is the missing link between "write a
 * strategy" and "it actually runs". Without this, a strategy author calls
 * `registerStrategy` and gets nothing else for free.
 *
 * Import order matters: this must be imported AFTER every `strategies/*`
 * side-effect import (see `use-detection-pass.ts`), so `allStrategies()`
 * already holds everything registered for this pass by the time it runs.
 * Re-running `wireStrategyDetectors` is harmless, because `registerDetector` keys on
 * id, so a repeat call just replaces the same entries with themselves.
 */
import { allStrategies, detectorFromStrategy } from './compare';
import { registerDetector } from './registry';

const wireStrategyDetectors = (): void => {
  for (const strategy of allStrategies()) registerDetector(detectorFromStrategy(strategy));
};

wireStrategyDetectors();

export { wireStrategyDetectors };
