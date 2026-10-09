/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ComparisonStrategy } from '../probe.type';
import { registeredStrategies } from './registered-strategies';

const strategyFor = (kind: EntityKind): ComparisonStrategy<EntityKind> | undefined => registeredStrategies.get(kind);

export { strategyFor };
