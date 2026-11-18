/* @layer renderer-components @kind logic */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import { OPTION_GROUPS } from '@rotp/randomizer';
import type { OptionDef, OptionValue, RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { OPTIONS_OF_SCOPE } from './build-option-facts.constants';
import type { OptionFactGroup, OptionScope } from './build-option-facts.type';

const valueLabel = (option: OptionDef, value: OptionValue, t: I18n['t'], text: (text: Text) => string): string => {
  const choice = option.choices?.find((candidate) => candidate.value === value);
  if (choice) return text(choice.label);
  if (typeof value === 'boolean') return value ? t('data-manager:profile-detail.run.on') : t('data-manager:profile-detail.run.off');
  return String(value);
};

const buildOptionFactGroups = (snapshot: RandomizerOptionsSnapshot, t: I18n['t'], text: (text: Text) => string, scope: OptionScope = 'changed'): OptionFactGroup[] => {
  const options = OPTIONS_OF_SCOPE[scope](snapshot);
  return OPTION_GROUPS.flatMap(({ id, label }) => {
    const facts = options
      .filter(({ option }) => option.group === id)
      .map(({ option, value }) => ({ label: text(option.displayName), value: valueLabel(option, value, t, text) }));
    return facts.length === 0 ? [] : [{ title: text(label), facts }];
  });
};

export { buildOptionFactGroups };
