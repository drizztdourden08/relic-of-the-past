/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import type { LanguageSetSummary } from '@rotp/languages';
import { STEP_IDS, stepLabels } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues } from '../LanguageCreateWizard.type';
import { reviewRows } from './review-rows';

const reviewSections = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[], t: I18n['t']): WizardReviewSection[] => [
  { stepId: STEP_IDS.details, title: stepLabels(t).details, rows: reviewRows(values, sets, t) },
];

export { reviewSections };
