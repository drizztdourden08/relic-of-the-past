/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ErasedStrategy } from '../probe.type';
import { registeredStrategies } from './registered-strategies';

const strategyFor = (kind: EntityKind): ErasedStrategy | undefined => registeredStrategies.get(kind);

export { strategyFor };
