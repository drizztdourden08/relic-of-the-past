/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '@drizztdourden08/brock-react';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';

const randomizerSummary = (values: ProfileWizardValues): string => {
  const { enabled, mode, seed } = wizardFactsOf(values);
  return enabled ? `${RUN_TYPE_LABELS[mode]}, ${seed.trim() || 'Random'}` : 'Off';
};

export { randomizerSummary };
