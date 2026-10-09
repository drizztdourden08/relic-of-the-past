/* @layer shared-game @kind logic */
import { pondKeyOf } from './pond-option-keys';
import {
  CAPACITY_POND_MODE_DESCRIPTION, POND_ITEMS_DESCRIPTION, POND_JUMPS_DESCRIPTION, WISH_POND_MODE_DESCRIPTION,
} from './pond-description-lines.data';
import type { OptionDescription } from '../option-description.type';
import type { PondInstance } from './pond-instance.type';

const pondDescriptionsOf = (pond: PondInstance): [string, OptionDescription][] => [
  [pondKeyOf(pond, 'mode'), pond.id === 'capacity' ? CAPACITY_POND_MODE_DESCRIPTION : WISH_POND_MODE_DESCRIPTION],
  [pondKeyOf(pond, 'items'), POND_ITEMS_DESCRIPTION],
  [pondKeyOf(pond, 'jumps'), POND_JUMPS_DESCRIPTION],
];

export { pondDescriptionsOf };
