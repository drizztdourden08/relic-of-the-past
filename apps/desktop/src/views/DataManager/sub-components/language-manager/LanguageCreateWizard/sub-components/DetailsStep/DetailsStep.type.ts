/* @layer renderer-components @kind types */
import type { LanguageSetSummary } from '@rotp/languages';
import type { LanguageWizardValues, UpdateValues } from '../../LanguageCreateWizard.type';

interface DetailsStepProps {
  values: LanguageWizardValues;
  update: UpdateValues;
  baseSets: LanguageSetSummary[];
}

type SourceFieldsProps = Pick<DetailsStepProps, 'values' | 'update'>;

export type { DetailsStepProps, SourceFieldsProps };
