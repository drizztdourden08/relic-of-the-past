/* @layer shared-game @kind logic */
import { allStrategies, detectorFromStrategy } from './compare';
import { registerDetector } from './registry';

const wireStrategyDetectors = (): void => {
  for (const strategy of allStrategies()) registerDetector(detectorFromStrategy(strategy));
};

wireStrategyDetectors();

export { wireStrategyDetectors };
