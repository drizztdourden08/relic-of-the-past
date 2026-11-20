/* @layer renderer-components @kind types */
import type { ProfileLanguage } from '../../../../profile-language.type';
import type { ProfileWizardValues, UpdateValues } from '../../ProfileCreateWizard.type';

interface ProfileStepProps {
  values: ProfileWizardValues;
  update: UpdateValues;
  readyRoms: RomDisplayInfo[];
  languages: ProfileLanguage[];
  msuPacks: Array<{ name: string }>;
}

export type { ProfileStepProps };
