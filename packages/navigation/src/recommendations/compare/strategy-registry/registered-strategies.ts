/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { ErasedStrategy } from '../probe.type';

const registeredStrategies = new Map<EntityKind, ErasedStrategy>();

export { registeredStrategies };
