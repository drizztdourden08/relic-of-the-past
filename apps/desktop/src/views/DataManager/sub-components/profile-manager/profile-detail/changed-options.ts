/* @layer renderer-components @kind logic */
import { optionCatalog } from '@rotp/randomizer';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { ChangedOption } from './build-option-facts.type';

const changedOptions = (snapshot: RandomizerOptionsSnapshot): ChangedOption[] =>
  optionCatalog.flatMap((option) => {
    const value = snapshot.values[option.key];
    return value === undefined || value === option.baseline ? [] : [{ option, value }];
  });

export { changedOptions };
