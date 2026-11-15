/* @layer renderer-components @kind types */
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import type { ProfileCreateWizardProps, ProfileWizardApi } from '../../ProfileCreateWizard.type';

interface StepBodyProps extends Pick<ProfileCreateWizardProps, 'readyRoms' | 'languages' | 'msuPacks'> {
  wizard: ProfileWizardApi;
  modules: readonly ProfileWizardStepDef[];
}

export type { StepBodyProps };
