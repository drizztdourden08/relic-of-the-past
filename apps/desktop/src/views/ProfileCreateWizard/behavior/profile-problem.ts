/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const profileProblem = (values: ProfileWizardValues, t: I18n['t']): string | null => {
  if (values.name.trim() === '') return t('wizards:profile.problem.no-name');
  return values.rom === '' ? t('wizards:profile.problem.no-rom') : null;
};

export { profileProblem };
