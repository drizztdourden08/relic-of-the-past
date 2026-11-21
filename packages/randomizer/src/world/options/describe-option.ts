/* @layer shared-game @kind logic */
import { OPTION_DESCRIPTIONS } from '../options-descriptions.constants';
import { detailsOf, plainTextOf } from '../option-description';
import type { OptionDef, OptionSeed } from '../options.type';

const describeOption = (seed: OptionSeed): OptionDef => {
  const entry = OPTION_DESCRIPTIONS[seed.key];
  return {
    ...seed,
    get description() {
      return entry === undefined ? '' : plainTextOf(entry);
    },
    get details() {
      return entry === undefined ? undefined : detailsOf(entry);
    },
  };
};

export { describeOption };
