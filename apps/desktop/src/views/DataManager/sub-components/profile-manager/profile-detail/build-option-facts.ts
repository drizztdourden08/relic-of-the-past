/* @layer renderer-components @kind logic */
import { OPTION_GROUPS } from '@rotp/randomizer';
import type { OptionDef, OptionValue, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { changedOptions } from './changed-options';
import type { OptionFactGroup } from './build-option-facts.type';

const valueLabel = (option: OptionDef, value: OptionValue): string => {
  const choice = option.choices?.find((candidate) => candidate.value === value);
  if (choice) return choice.label;
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  return String(value);
};

const buildOptionFactGroups = (snapshot: RandomizerOptionsSnapshot): OptionFactGroup[] => {
  const changed = changedOptions(snapshot);
  return OPTION_GROUPS.flatMap(({ id, label }) => {
    const facts = changed
      .filter(({ option }) => option.group === id)
      .map(({ option, value }) => ({ label: option.displayName, value: valueLabel(option, value) }));
    return facts.length === 0 ? [] : [{ title: label, facts }];
  });
};

export { buildOptionFactGroups };
