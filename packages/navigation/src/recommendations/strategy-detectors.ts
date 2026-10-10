/* @layer shared-game @kind logic */
import { allStrategies } from './compare';
import { registerDetector } from './registry';

const wireStrategyDetectors = (): void => {
  for (const strategy of allStrategies()) registerDetector(strategy.detector());
};

wireStrategyDetectors();

export { wireStrategyDetectors };
