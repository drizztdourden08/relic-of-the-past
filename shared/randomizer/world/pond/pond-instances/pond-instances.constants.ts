/* @layer shared-game @kind constants */
import { instanceOf } from './instance-of';
import type { PondId, PondInstance } from '../pond-instance.type';

const POND_IDS: readonly PondId[] = ['capacity', 'wishing', 'cursed'];

const POND_INSTANCES: readonly PondInstance[] = POND_IDS.map(instanceOf);

const POND_INSTANCE_BY_ID: Readonly<Record<PondId, PondInstance>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pond]),
) as Readonly<Record<PondId, PondInstance>>;

const CAPACITY_POND: PondInstance = POND_INSTANCE_BY_ID.capacity;

export { CAPACITY_POND, POND_IDS, POND_INSTANCES, POND_INSTANCE_BY_ID };
