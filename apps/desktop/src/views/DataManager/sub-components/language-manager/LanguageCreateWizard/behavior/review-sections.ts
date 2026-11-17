/* @layer renderer-components @kind logic */
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import type { LanguageSetSummary } from '@rotp/languages';
import { STEP_IDS, STEP_LABELS } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues } from '../LanguageCreateWizard.type';
import { reviewRows } from './review-rows';

const reviewSections = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[]): WizardReviewSection[] => [
  { stepId: STEP_IDS.details, title: STEP_LABELS.details, rows: reviewRows(values, sets) },
];

export { reviewSections };
