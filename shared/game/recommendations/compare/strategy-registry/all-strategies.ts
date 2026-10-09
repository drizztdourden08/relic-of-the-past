/* @layer shared-game @kind logic */
import type { EntityKind } from '../../../data/types';
import type { ComparisonStrategy } from '../probe.type';
import { registeredStrategies } from './registered-strategies';

const allStrategies = (): readonly ComparisonStrategy<EntityKind>[] => [...registeredStrategies.values()];

export { allStrategies };
