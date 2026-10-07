/* @layer renderer-components @kind logic */
/**
 * The edit handlers of the options tabs, built from the one change callback
 * the panel holds. A read-only panel holds none, so every handler it builds
 * is absent, and an absent handler is what draws a block as a read-out. That
 * keeps each block's wiring to one line whichever way the panel is shown.
 */
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

type ChoiceEdit = <T>(build: (next: T) => RandomizerOptionChoices) => ((next: T) => void) | undefined;

const choiceEditOf = (onChange?: (next: RandomizerOptionChoices) => void): ChoiceEdit =>
  <T>(build: (next: T) => RandomizerOptionChoices) =>
    (onChange === undefined ? undefined : (next: T) => onChange(build(next)));

export { choiceEditOf };
export type { ChoiceEdit };
