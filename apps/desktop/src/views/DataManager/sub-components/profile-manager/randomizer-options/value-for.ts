/* @layer renderer-components @kind logic */
import { CAPACITY_ENABLED_KEY, pondIdOfModeKey } from '@rotp/randomizer';
import { PLAIN_FIELD_BY_KEY } from '@app/hooks/randomizer/randomizer-choices';
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

const snapshotValue = (values: Readonly<Record<string, OptionValue>>, key: string): OptionValue => {
  const value = values[key];
  if (value === undefined) throw new Error(`the options snapshot has no value for ${key}`);
  return value;
};

const valueFor = (
  option: OptionDef, chosen: RandomizerOptionChoices, values: Readonly<Record<string, OptionValue>>,
): OptionValue => {
  if (option.key === CAPACITY_ENABLED_KEY || pondIdOfModeKey(option.key) !== undefined) return snapshotValue(values, option.key);
  const field = PLAIN_FIELD_BY_KEY[option.key];
  return field === undefined ? option.baseline : chosen[field];
};

export { valueFor };
