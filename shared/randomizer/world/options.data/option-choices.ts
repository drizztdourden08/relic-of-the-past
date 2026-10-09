/* @layer shared-game @kind logic */
import type { OptionChoice, OptionChoiceSpec } from '../options.type';

const humanize = (key: string): string =>
  key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const optionChoices = (...values: OptionChoiceSpec[]): OptionChoice[] =>
  values.map(([value, sourceValue, label]) => ({ value, sourceValue, label: label ?? humanize(value) }));

export { optionChoices };
