/* @layer renderer-components @kind types */
import type { ProfileWizardValues, UpdateValues } from '../../ProfileCreateWizard.type';

interface RandomizerStepProps {
  values: ProfileWizardValues;
  update: UpdateValues;
  experimental: boolean;
}

export type { RandomizerStepProps };
