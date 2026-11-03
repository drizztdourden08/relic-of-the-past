/* @layer renderer-components @kind logic */
import { randomizerFormError } from '../../build-randomizer-config';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const connectionProblem = (experimental: boolean) => ({ randomizer }: ProfileWizardValues): string | null =>
  randomizerFormError(randomizer, experimental) ?? null;

export { connectionProblem };
