/* @layer renderer-components @kind logic */
import { optionCatalog } from '@rotp/randomizer';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { ChangedOption } from './build-option-facts.type';

const allOptions = (snapshot: RandomizerOptionsSnapshot): ChangedOption[] =>
  optionCatalog.map((option) => ({ option, value: snapshot.values[option.key] ?? option.baseline }));

export { allOptions };
