/* @layer renderer-components @kind logic */
import type { LabelledGroup, LabelledValue } from '../OptionValueTag.type';

const isGroup = (entry: LabelledValue | LabelledGroup): entry is LabelledGroup => 'options' in entry;

const choiceLabelOf = (choices: readonly (LabelledValue | LabelledGroup)[], value: string): string =>
  choices.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]))
    .find((choice) => choice.value === value)?.label ?? value;

export { choiceLabelOf };
