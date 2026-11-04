/* @layer renderer-components @kind constants */
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { allOptions } from './all-options';
import type { ChangedOption, OptionScope } from './build-option-facts.type';
import { changedOptions } from './changed-options';

const OPTIONS_OF_SCOPE: Readonly<Record<OptionScope, (snapshot: RandomizerOptionsSnapshot) => ChangedOption[]>> = {
  changed: changedOptions,
  all: allOptions,
};

export { OPTIONS_OF_SCOPE };
