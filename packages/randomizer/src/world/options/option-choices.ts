/* @layer shared-game @kind logic */
import { CHOICE_LABELS } from './choice-labels.constants';
import type { OptionChoice, OptionChoiceSpec } from '../options.type';

const humanize = (key: string): string =>
  key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const optionChoices = (...values: OptionChoiceSpec[]): OptionChoice[] =>
  values.map(([value, sourceValue, label]) => ({
    value, sourceValue, label: label ?? CHOICE_LABELS[value] ?? humanize(value),
  }));

export { optionChoices };
