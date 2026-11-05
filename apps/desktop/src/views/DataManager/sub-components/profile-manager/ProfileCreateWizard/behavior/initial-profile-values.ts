/* @layer renderer-components @kind logic */
import { wizardInitialSlices } from '@drizztdourden08/brock-react';
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const initialProfileValues = (modules: readonly ProfileWizardStepDef[]): ProfileWizardValues => ({
  name: '',
  rom: '',
  preset: 'enhanced',
  language: '',
  msuPack: '',
  ...wizardInitialSlices(modules),
});

export { initialProfileValues };
