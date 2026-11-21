/* @layer renderer-components @kind types */
import type { ProfileCreateWizardProps, ProfileWizardApi } from '../../ProfileCreateWizard.type';

interface ReviewStepProps extends Pick<ProfileCreateWizardProps, 'languages'> {
  wizard: ProfileWizardApi;
}

export type { ReviewStepProps };
