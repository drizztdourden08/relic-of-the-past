/* @layer renderer-components @kind types */
import type { ProfileWizardValues, UpdateValues } from '../../ProfileCreateWizard.type';

interface ProfileStepProps {
  values: ProfileWizardValues;
  update: UpdateValues;
  readyRoms: RomDisplayInfo[];
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
}

export type { ProfileStepProps };
