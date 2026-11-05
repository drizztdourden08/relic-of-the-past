/* @layer renderer-components @kind logic */
import { EMPTY_RANDOMIZER_FORM } from './build-randomizer-config.constants';
import { randomSeed } from '@app/randomizer/roll/random-seed';
import type { RandomizerFormState } from './build-randomizer-config.type';

const freshRandomizerForm = (): RandomizerFormState => ({ ...EMPTY_RANDOMIZER_FORM, seed: randomSeed() });

export { freshRandomizerForm };
