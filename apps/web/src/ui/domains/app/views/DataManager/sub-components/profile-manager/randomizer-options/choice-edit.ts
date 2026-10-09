/* @layer renderer-components @kind logic */
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { ChoiceEdit } from './choice-edit.type';

const choiceEditOf = (onChange?: (next: RandomizerOptionChoices) => void): ChoiceEdit =>
  <T>(build: (next: T) => RandomizerOptionChoices) =>
    (onChange === undefined ? undefined : (next: T) => onChange(build(next)));

export { choiceEditOf };
