/* @layer renderer-hooks @kind logic */
import type { OptionDef } from '@rotp/randomizer';
import { GROUP_TAB, OPTION_TAB_RULES } from './option-tab-rules.constants';
import type { OptionTabId } from './option-tab-model.type';

const tabOfOption = (option: OptionDef): OptionTabId =>
  OPTION_TAB_RULES.find((rule) => rule.matches(option))?.tab ?? GROUP_TAB[option.group] ?? 'world';

export { tabOfOption };
