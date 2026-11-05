/* @layer renderer-components @kind logic */
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const randomizerSummary = (values: ProfileWizardValues): string => {
  const { enabled, mode, seed } = wizardFactsOf(values);
  return enabled ? `${RUN_TYPE_LABELS[mode]}, ${seed.trim() || 'Random'}` : 'Off';
};

export { randomizerSummary };
