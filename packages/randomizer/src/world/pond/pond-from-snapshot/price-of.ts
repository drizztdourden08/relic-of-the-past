/* @layer shared-game @kind logic */
import { optionNumberOf } from '../../capacity/option-number-of';
import { POND_PRICE_LADDER } from '../pond-ladder.data';
import { rungOf } from '../pond-plan';
import type { OptionValue } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';

const priceOf = (raw: OptionValue | undefined, fallback: number, pond: PondInstance, notes: string[]): number => {
  const value = optionNumberOf(raw);
  if (POND_PRICE_LADDER.includes(value)) return value;
  if (Number.isFinite(value)) {
    const snapped = POND_PRICE_LADDER[rungOf(value)];
    notes.push(`${pond.label}: ${value} is not a pond price, using ${snapped}`);
    return snapped;
  }
  return fallback;
};

export { priceOf };
