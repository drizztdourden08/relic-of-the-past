/* @layer renderer-components @kind logic */
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import { STEP_IDS, STEP_LABELS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues, StepContext } from '../ProfileCreateWizard.type';
import { connectionRows, optionRows, profileRows, randomizerRows } from './review-rows';
import { needsConnection } from './step-conditions';

const reviewSections = (values: ProfileWizardValues, { experimental }: Pick<StepContext, 'experimental'>): WizardReviewSection[] => {
  const { randomizer } = values;
  const sections: WizardReviewSection[] = [
    { stepId: STEP_IDS.profile, title: STEP_LABELS.profile, rows: profileRows(values) },
    { stepId: STEP_IDS.randomizer, title: STEP_LABELS.randomizer, rows: randomizerRows(values) },
  ];
  if (needsConnection(randomizer, experimental)) {
    sections.push({ stepId: STEP_IDS.connection, title: STEP_LABELS.connection, rows: connectionRows(values) });
  }
  if (randomizer.enabled) sections.push({ stepId: STEP_IDS.options, title: STEP_LABELS.options, rows: optionRows(values) });
  return sections;
};

export { reviewSections };
