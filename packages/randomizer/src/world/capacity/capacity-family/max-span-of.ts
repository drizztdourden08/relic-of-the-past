/* @layer shared-game @kind logic */
import type { CapacityFamily } from './capacity-family.type';

const maxSpanOf = (capacityFamily: CapacityFamily): number => capacityFamily.ladder.length - 1;

export { maxSpanOf };
