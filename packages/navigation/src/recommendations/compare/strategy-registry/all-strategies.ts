/* @layer shared-game @kind logic */
import type { ErasedStrategy } from '../probe.type';
import { registeredStrategies } from './registered-strategies';

const allStrategies = (): readonly ErasedStrategy[] => [...registeredStrategies.values()];

export { allStrategies };
