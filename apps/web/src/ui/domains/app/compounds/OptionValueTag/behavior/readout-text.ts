/* @layer renderer-components @kind logic */
/**
 * The words a read-out tag shows for the controls that do not hold their own
 * text: a picked choice, as the label it was picked by, a range, as its two
 * ends, and a list of steps, as its numbers.
 */
import type { LabelledValue } from '../OptionValueTag.type';

/** A group of choices, the way a grouped dropdown lists them. */
interface LabelledGroup {
  options: readonly LabelledValue[];
}

const isGroup = (entry: LabelledValue | LabelledGroup): entry is LabelledGroup => 'options' in entry;

/** The chosen entry's label, looked up in a flat or grouped list; the raw value when none matches. */
const choiceLabelOf = (choices: readonly (LabelledValue | LabelledGroup)[], value: string): string =>
  choices.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]))
    .find((choice) => choice.value === value)?.label ?? value;

/** A range picked on a row of stops, as its two ends in words. */
const rangeLabelOf = (stops: readonly (string | number)[], range: readonly [number, number]): string =>
  `${stops[range[0]]} to ${stops[range[1]]}`;

/** A list of steps (price or capacity jumps), as the numbers in order. */
const stepsLabelOf = (steps: readonly number[]): string => steps.join(', ');

export { choiceLabelOf, rangeLabelOf, stepsLabelOf };
export type { LabelledGroup };
