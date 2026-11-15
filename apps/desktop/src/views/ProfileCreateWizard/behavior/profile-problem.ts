/* @layer renderer-components @kind logic */
import { NO_NAME_ERROR, NO_ROM_ERROR } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const profileProblem = (values: ProfileWizardValues): string | null => {
  if (values.name.trim() === '') return NO_NAME_ERROR;
  return values.rom === '' ? NO_ROM_ERROR : null;
};

export { profileProblem };
