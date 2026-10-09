/* @layer shared-game @kind logic */
import { optionNumberOf } from '../../capacity/option-number-of';
import { POND_MAX_ITEMS } from '../pond-ladder.data';
import { DEFAULT_POND_ITEMS } from '../pond-profile-defaults';
import { pondKeyOf } from '../pond-option-keys';
import { clamped } from './clamped';
import type { PartialOptionValues } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';

const itemsOf = (values: PartialOptionValues, pond: PondInstance): number =>
  clamped(optionNumberOf(values[pondKeyOf(pond, 'items')]), 0, POND_MAX_ITEMS, DEFAULT_POND_ITEMS);

export { itemsOf };
