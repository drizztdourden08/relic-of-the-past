/* @layer renderer-lib @kind logic */
import { buildOptionsSnapshot } from '@rotp/randomizer';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from './randomizer-choices.type';
import { randomizerChoiceOverrides } from './randomizer-choice-overrides';

const snapshotOfChoices = (choices: RandomizerOptionChoices): RandomizerOptionsSnapshot =>
  buildOptionsSnapshot(randomizerChoiceOverrides(choices));

export { snapshotOfChoices };
