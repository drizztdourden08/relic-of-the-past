/* @layer renderer-components @kind logic */
import { placeWizardSteps } from '@drizztdourden08/brock-react';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { CREATING_HINT, FINISH_LABEL, STEP_IDS, STEP_LABELS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues, StepContext } from '../ProfileCreateWizard.type';
import { profileProblem } from './profile-problem';
import { profileSummary } from './profile-summary';

const busyHintOf = (joining: number | null): string =>
  (joining === null ? CREATING_HINT : `Joining the lobby, ${Math.round(joining * 100)}%`);

const profileWizardSteps = ({ joining, modules }: StepContext): readonly WizardStepDef<ProfileWizardValues>[] =>
  placeWizardSteps<ProfileWizardValues>(
    [
      {
        id: STEP_IDS.profile,
        label: STEP_LABELS.profile,
        validate: profileProblem,
        summary: profileSummary,
      },
      {
        id: STEP_IDS.review,
        label: STEP_LABELS.review,
        buttons: { next: { label: FINISH_LABEL } },
        busyHint: () => busyHintOf(joining),
      },
    ],
    modules,
  );

export { profileWizardSteps };
