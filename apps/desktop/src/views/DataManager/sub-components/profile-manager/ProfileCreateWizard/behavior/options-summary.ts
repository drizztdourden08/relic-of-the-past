/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { changedTotalOf } from './changed-total-of';

const optionsSummary = (values: ProfileWizardValues): string => {
  const total = changedTotalOf(values);
  return total === 0 ? 'Defaults' : `${total} changed`;
};

export { optionsSummary };
