/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { changedCountsOfValues } from './changed-counts-of-values';

const optionsSummary = (values: ProfileWizardValues): string => {
  const total = Object.values(changedCountsOfValues(values)).reduce((sum, count) => sum + count, 0);
  return total === 0 ? 'Defaults' : `${total} changed`;
};

export { optionsSummary };
