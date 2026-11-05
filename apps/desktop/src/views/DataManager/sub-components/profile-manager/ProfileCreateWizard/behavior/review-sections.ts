/* @layer renderer-components @kind logic */
import { randomizerReviewSections } from '@drizztdourden08/brock-randomizer/renderer';
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import { STEP_IDS, STEP_LABELS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { profileRows } from './profile-rows';

const reviewSections = (values: ProfileWizardValues): WizardReviewSection[] => [
  { stepId: STEP_IDS.profile, title: STEP_LABELS.profile, rows: profileRows(values) },
  ...randomizerReviewSections(values),
];

export { reviewSections };
