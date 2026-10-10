/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ComparisonStrategy, ErasedStrategy } from './probe.type';
import { detectorFromStrategy } from './detector-from-strategy';
import { runComparison } from './run-comparison';

const eraseStrategy = <K extends EntityKind>(strategy: ComparisonStrategy<K>): ErasedStrategy => ({
  kind: strategy.kind,
  compare: (observations, screenId) => runComparison(strategy, observations, screenId),
  detector: () => detectorFromStrategy(strategy),
});

export { eraseStrategy };
