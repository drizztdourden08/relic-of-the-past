/* @layer renderer-lib @kind logic */
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { RandomizerOptionChoices } from './randomizer-choices.type';
import { randomizerChoiceOverrides } from './randomizerChoiceOverrides';

const snapshotOfChoices = (choices: RandomizerOptionChoices): RandomizerOptionsSnapshot =>
  buildOptionsSnapshot(randomizerChoiceOverrides(choices));

export { snapshotOfChoices };
