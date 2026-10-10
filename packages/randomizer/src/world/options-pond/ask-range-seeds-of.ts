/* @layer shared-game @kind logic */
import { entryOf } from '../../checked-access';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from '../pond/pond-ask-keys';
import { POND_PRICE_CHOICES } from './pond-option-choices.constants';
import type { PondAskRow } from '../pond/pond.type';
import type { PondInstance } from '../pond/pond-instance.type';
import type { OptionChoice, OptionSeed, OptionValue, OptionValues } from '../options.type';

const amountChoicesOf = (stops: readonly number[]): readonly OptionChoice[] => stops.map((value) => ({
  value: String(value),
  sourceValue: value,
  label: value === 0 ? 'free' : String(value),
}));

const askChoiceSeed = (
  key: string, displayName: string, choices: readonly OptionChoice[], value: OptionValue,
): OptionSeed => ({
  key, displayName, group: 'items', kind: 'choice', choices, implementation: 'active',
  locked: false, synthetic: true, sourceDefault: value, baseline: value,
});

const askRangeSeedsOf = (pond: PondInstance, row: PondAskRow, rows: OptionValues): OptionSeed[] => {
  const { currency, label, stops } = row;
  const choices = currency === 'rupees' ? POND_PRICE_CHOICES : amountChoicesOf(stops);
  const min = pondAskMinKeyOf(pond, currency);
  const max = pondAskMaxKeyOf(pond, currency);
  return [
    askChoiceSeed(min, `${pond.label} ${label.toLowerCase()} at the first rung`, choices, entryOf(rows, min)),
    askChoiceSeed(max, `${pond.label} ${label.toLowerCase()} at the last rung`, choices, entryOf(rows, max)),
  ];
};

export { askRangeSeedsOf };
