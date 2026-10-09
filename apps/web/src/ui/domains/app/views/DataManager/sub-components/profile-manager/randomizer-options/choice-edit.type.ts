/* @layer renderer-components @kind types */
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

type ChoiceEdit = <T>(build: (next: T) => RandomizerOptionChoices) => ((next: T) => void) | undefined;

export type { ChoiceEdit };
