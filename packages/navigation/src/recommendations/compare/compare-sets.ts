/* @layer shared-game @kind logic */
import type { EntityKind, ScreenId } from '@rotp/game-data';
import type { ScreenObservations } from '../detection-types';
import type { SetDifference } from './difference.type';
import type { ComparisonStrategy } from './probe.type';

const compareSets = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  observations: ScreenObservations,
  screenId: ScreenId | null,
): readonly SetDifference<K>[] => strategy.sets.flatMap(probe => probe.compare(observations, screenId));

export { compareSets };
