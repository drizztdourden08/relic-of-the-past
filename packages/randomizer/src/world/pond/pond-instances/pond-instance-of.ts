/* @layer shared-game @kind logic */
import { POND_INSTANCE_BY_ID } from './pond-instances.constants';
import type { PondId, PondInstance } from '../pond-instance.type';

const pondInstanceOf = (id: PondId): PondInstance => POND_INSTANCE_BY_ID[id];

export { pondInstanceOf };
