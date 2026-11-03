/* @layer renderer-components @kind logic */
import { NO_SEED_ERROR } from '../../build-randomizer-config';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const seedProblem = ({ randomizer }: ProfileWizardValues): string | null =>
  (randomizer.enabled && randomizer.seed.trim() === '' ? NO_SEED_ERROR : null);

export { seedProblem };
