/* @layer shared-game @kind logic */
import type { PondInstance } from '../pond-instance.type';

const askKeyOf = (pond: PondInstance, row: string): string => `pond_${pond.id}_ask_${row}`;

export { askKeyOf };
