/* @layer shared-game @kind logic */
import type { EntityKind, ScreenId } from '@rotp/game-data';
import type { ScreenObservations } from '../detection-types';
import { compareField } from './compare-field';
import type { Difference, SubjectComparison } from './difference.type';
import type { ComparisonStrategy } from './probe.type';

const runComparison = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  observations: ScreenObservations,
  screenId: ScreenId | null,
): readonly SubjectComparison<K>[] => {
  const subjects = strategy.subjects(observations, screenId);
  return subjects.map(record => ({
    record,
    differences: strategy.fields
      .map(probe => compareField(probe, record, observations))
      .filter((difference): difference is Difference => difference !== null),
  }));
};

export { runComparison };
