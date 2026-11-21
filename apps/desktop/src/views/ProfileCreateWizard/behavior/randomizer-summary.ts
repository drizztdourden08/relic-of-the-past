/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '@drizztdourden08/brock-react';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { runTypeLabels } from '@app/views/DataManager/sub-components/profile-manager/profile-detail/build-run-facts.constants';

const randomizerSummary = (t: I18n['t']) => (values: ProfileWizardValues): string => {
  const { enabled, mode, seed } = wizardFactsOf(values);
  if (!enabled) return t('data-manager:profile-detail.run.off');
  return t('data-manager:profile-wizard.randomizer-summary', {
    type: runTypeLabels(t)[mode],
    seed: seed.trim() || t('data-manager:profile-wizard.random-seed'),
  });
};

export { randomizerSummary };
