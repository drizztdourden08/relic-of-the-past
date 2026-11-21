/* @layer renderer-components @kind types */
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import type { ProfileWizardValues, UpdateValues } from '../../ProfileCreateWizard.type';

interface ModuleStepProps {
  stepId: string;
  modules: readonly ProfileWizardStepDef[];
  values: ProfileWizardValues;
  update: UpdateValues;
}

export type { ModuleStepProps };
