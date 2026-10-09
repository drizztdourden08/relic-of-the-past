/* @layer renderer-hooks @kind logic */
import { optionCatalog } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
import { EMPTY_COUNTS } from './option-tab-model.constants';
import type { ChangedCounts } from './option-tab-model.type';
import { tabOfOption } from './tab-of-option';
import { isChanged } from './is-changed';

const changedCountsOf = (values: Readonly<Record<string, OptionValue>>): ChangedCounts => {
  const counts = { ...EMPTY_COUNTS };
  for (const option of optionCatalog) {
    if (option.locked || !isChanged(option, values[option.key])) continue;
    counts[tabOfOption(option)] += 1;
  }
  return counts;
};

export { changedCountsOf };
