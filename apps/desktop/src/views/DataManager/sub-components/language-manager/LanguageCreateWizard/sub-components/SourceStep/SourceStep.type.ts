/* @layer renderer-components @kind types */
import type { LanguageWizardValues, UpdateValues } from '../../LanguageCreateWizard.type';

interface SourceStepProps {
  values: LanguageWizardValues;
  update: UpdateValues;
  hasOwnSets: boolean;
}

export type { SourceStepProps };
