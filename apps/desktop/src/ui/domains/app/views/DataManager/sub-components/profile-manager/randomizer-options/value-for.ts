/* @layer renderer-components @kind logic */
import { CAPACITY_ENABLED_KEY } from '@shared/randomizer/world/capacity';
import { pondIdOfModeKey } from '@shared/randomizer/world/pond/pond-option-keys';
import { PLAIN_FIELD_BY_KEY } from '@app/hooks/randomizer/randomizer-choices';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

const valueFor = (
  option: OptionDef, chosen: RandomizerOptionChoices, values: Readonly<Record<string, OptionValue>>,
): OptionValue => {
  if (option.key === CAPACITY_ENABLED_KEY || pondIdOfModeKey(option.key) !== undefined) return values[option.key];
  const field = PLAIN_FIELD_BY_KEY[option.key];
  return field === undefined ? option.baseline : chosen[field];
};

export { valueFor };
