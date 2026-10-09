/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ComparisonStrategy } from '../probe.type';
import { registeredStrategies } from './registered-strategies';

const registerStrategy = <K extends EntityKind>(strategy: ComparisonStrategy<K>): void => {
  registeredStrategies.set(strategy.kind, strategy as unknown as ComparisonStrategy<EntityKind>);
};

export { registerStrategy };
