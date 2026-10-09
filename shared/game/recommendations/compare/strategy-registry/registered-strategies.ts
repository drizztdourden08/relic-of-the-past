/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ComparisonStrategy } from '../probe.type';

const registeredStrategies = new Map<EntityKind, ComparisonStrategy<EntityKind>>();

export { registeredStrategies };
