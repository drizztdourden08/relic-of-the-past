/* @layer shared-game @kind logic */
import { OPTION_DESCRIPTIONS } from '../options-descriptions.data';
import { detailsOf, plainTextOf } from '../option-description';
import type { OptionDef } from '../options.type';

const describeOption = (key: string): Pick<OptionDef, 'description' | 'details'> => {
  const entry = OPTION_DESCRIPTIONS[key];
  if (entry === undefined) return { description: '', details: undefined };
  return { description: plainTextOf(entry), details: detailsOf(entry) };
};

export { describeOption };
