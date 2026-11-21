/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfileWizardValues } from '@drizztdourden08/brock-react';
import { changedCountsOfValues } from './changed-counts-of-values';

const optionsSummary = (t: I18n['t']) => (values: ProfileWizardValues): string => {
  const total = Object.values(changedCountsOfValues(values)).reduce((sum, count) => sum + count, 0);
  return total === 0 ? t('data-manager:profile-wizard.options-defaults') : t('data-manager:profile-wizard.options-changed', { count: total });
};

export { optionsSummary };
