/* @layer shared-game @kind logic */
import { optionNumberOf } from '../../capacity/option-number-of';
import { POND_MAX_THROWS } from '../pond-ladder.constants';
import { DEFAULT_POND_CUSTOM } from '../pond-profile-defaults';
import { pondKeyOf } from '../pond-option-keys';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from '../pond-ask-keys';
import { parsePondAsk } from '../pond-ask-from-snapshot';
import { rungOf } from '../pond-plan';
import { clamped } from './clamped';
import { itemsOf } from './items-of';
import { priceOf } from './price-of';
import { shapeOf } from './shape-of';
import type { PartialOptionValues } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const customOf = (values: PartialOptionValues, pond: PondInstance, notes: string[]): PondSetting => {
  const start = priceOf(values[pondAskMinKeyOf(pond, 'rupees')], DEFAULT_POND_CUSTOM.start, pond, notes);
  let max = priceOf(values[pondAskMaxKeyOf(pond, 'rupees')], DEFAULT_POND_CUSTOM.max, pond, notes);
  if (max < start) {
    notes.push(`${pond.label}: the final price ${max} is below the first ${start}, clamping to ${start}`);
    max = start;
  }
  const span = rungOf(max) - rungOf(start);
  const throws = clamped(
    optionNumberOf(values[pondKeyOf(pond, 'throws')]), 1, POND_MAX_THROWS, DEFAULT_POND_CUSTOM.throws);
  const shape = shapeOf(values, pond, Math.max(0, span), notes);
  const ask = parsePondAsk(values, pond, { min: start, max });
  return {
    mode: 'custom',
    start,
    max,
    throws: shape.curve === 'free' ? shape.jumps.length + 1 : throws,
    items: itemsOf(values, pond),
    shape,
    ...(ask === undefined ? {} : { ask }),
  };
};

export { customOf };
