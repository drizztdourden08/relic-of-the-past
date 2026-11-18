/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { randomizerReviewSections } from '@drizztdourden08/brock-randomizer/renderer';
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import { STEP_IDS, stepLabels } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { profileRows } from './profile-rows';

const reviewSections = (values: ProfileWizardValues, t: I18n['t']): WizardReviewSection[] => [
  { stepId: STEP_IDS.profile, title: stepLabels(t).profile, rows: profileRows(values, t) },
  ...randomizerReviewSections(values),
];

export { reviewSections };
