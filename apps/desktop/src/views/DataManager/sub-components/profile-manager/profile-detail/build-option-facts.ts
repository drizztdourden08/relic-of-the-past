/* @layer renderer-components @kind logic */
import { OPTION_GROUPS } from '@rotp/randomizer';
import type { OptionDef, OptionValue, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { OPTIONS_OF_SCOPE } from './build-option-facts.constants';
import type { OptionFactGroup, OptionScope } from './build-option-facts.type';

const valueLabel = (option: OptionDef, value: OptionValue): string => {
  const choice = option.choices?.find((candidate) => candidate.value === value);
  if (choice) return choice.label;
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  return String(value);
};

const buildOptionFactGroups = (snapshot: RandomizerOptionsSnapshot, scope: OptionScope = 'changed'): OptionFactGroup[] => {
  const options = OPTIONS_OF_SCOPE[scope](snapshot);
  return OPTION_GROUPS.flatMap(({ id, label }) => {
    const facts = options
      .filter(({ option }) => option.group === id)
      .map(({ option, value }) => ({ label: option.displayName, value: valueLabel(option, value) }));
    return facts.length === 0 ? [] : [{ title: label, facts }];
  });
};

export { buildOptionFactGroups };
