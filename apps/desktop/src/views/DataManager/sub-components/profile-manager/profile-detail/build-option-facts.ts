/* @layer renderer-components @kind logic */
import { OPTION_GROUPS, optionCatalog } from '@rotp/randomizer';
import type { OptionDef, OptionValue, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { changedOptions } from './changed-options';
import type { ChangedOption, OptionFactGroup, OptionScope } from './build-option-facts.type';

const valueLabel = (option: OptionDef, value: OptionValue): string => {
  const choice = option.choices?.find((candidate) => candidate.value === value);
  if (choice) return choice.label;
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  return String(value);
};

const allOptions = (snapshot: RandomizerOptionsSnapshot): ChangedOption[] =>
  optionCatalog.map((option) => ({ option, value: snapshot.values[option.key] ?? option.baseline }));

const OPTIONS_OF_SCOPE: Readonly<Record<OptionScope, (snapshot: RandomizerOptionsSnapshot) => ChangedOption[]>> = {
  changed: changedOptions,
  all: allOptions,
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
