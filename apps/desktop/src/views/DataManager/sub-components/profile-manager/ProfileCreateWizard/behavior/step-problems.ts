/* @layer renderer-components @kind logic */
import { NO_SEED_ERROR, randomizerFormError } from '../../build-randomizer-config';
import { NO_NAME_ERROR, NO_ROM_ERROR } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const profileProblem = (values: ProfileWizardValues): string | null => {
  if (values.name.trim() === '') return NO_NAME_ERROR;
  return values.rom === '' ? NO_ROM_ERROR : null;
};

const seedProblem = ({ randomizer }: ProfileWizardValues): string | null =>
  (randomizer.enabled && randomizer.seed.trim() === '' ? NO_SEED_ERROR : null);

const connectionProblem = (experimental: boolean) => ({ randomizer }: ProfileWizardValues): string | null =>
  randomizerFormError(randomizer, experimental) ?? null;

export { connectionProblem, profileProblem, seedProblem };
