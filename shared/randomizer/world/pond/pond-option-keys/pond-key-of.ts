/* @layer shared-game @kind logic */
import type { PondInstance } from '../pond-instance.type';
import type { PondField } from '../pond.type';

const pondKeyOf = (pond: PondInstance, field: PondField): string => `pond_${pond.id}_${field}`;

export { pondKeyOf };
