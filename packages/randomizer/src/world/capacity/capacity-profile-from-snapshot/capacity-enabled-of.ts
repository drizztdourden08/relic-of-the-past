/* @layer shared-game @kind logic */
import { CAPACITY_ENABLED_KEY } from '../capacity-option-keys';
import type { PartialOptionValues } from '../../options.type';

const capacityEnabledOf = (values: PartialOptionValues): boolean => values[CAPACITY_ENABLED_KEY] !== false;

export { capacityEnabledOf };
