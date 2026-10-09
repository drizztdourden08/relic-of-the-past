/* @layer shared-game @kind logic */
import { CAPACITY_PROGRESSIVE_KEY } from '../capacity-option-keys';
import type { PartialOptionValues } from '../../options.type';

const capacityProgressiveOf = (values: PartialOptionValues): boolean => values[CAPACITY_PROGRESSIVE_KEY] !== false;

export { capacityProgressiveOf };
