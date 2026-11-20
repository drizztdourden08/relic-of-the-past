/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { entryOf } from '../../checked-access';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from '../pond/pond-ask-keys';
import { POND_PRICE_CHOICES } from './pond-option-choices.constants';
import type { PondAskRow } from '../pond/pond.type';
import type { PondInstance } from '../pond/pond-instance.type';
import type { OptionChoice, OptionSeed, OptionValue, OptionValues } from '../options.type';

const amountChoicesOf = (stops: readonly number[]): readonly OptionChoice[] => stops.map((value) => ({
  value: String(value),
  sourceValue: value,
  label: value === 0 ? msg('randomizer-world:choice.free') : String(value),
}));

const askChoiceSeed = (
  key: string, displayName: Text, choices: readonly OptionChoice[], value: OptionValue,
): OptionSeed => ({
  key, displayName, group: 'items', kind: 'choice', choices, implementation: 'active',
  locked: false, synthetic: true, sourceDefault: value, baseline: value,
});

const askRangeSeedsOf = (pond: PondInstance, row: PondAskRow, rows: OptionValues): OptionSeed[] => {
  const { currency, stops } = row;
  const choices = currency === 'rupees' ? POND_PRICE_CHOICES : amountChoicesOf(stops);
  const min = pondAskMinKeyOf(pond, currency);
  const max = pondAskMaxKeyOf(pond, currency);
  return [
    askChoiceSeed(min, msg('randomizer-world:tpl.pond.askFirst', { pond: pond.label, currency }), choices, entryOf(rows, min)),
    askChoiceSeed(max, msg('randomizer-world:tpl.pond.askLast', { pond: pond.label, currency }), choices, entryOf(rows, max)),
  ];
};

export { askRangeSeedsOf };
