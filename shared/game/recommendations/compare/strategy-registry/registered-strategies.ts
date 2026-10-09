/* @layer shared-game @kind logic */
import type { EntityKind } from '../../../data/types';
import type { ComparisonStrategy } from '../probe.type';

const registeredStrategies = new Map<EntityKind, ComparisonStrategy<EntityKind>>();

export { registeredStrategies };
