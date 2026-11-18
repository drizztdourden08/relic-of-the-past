/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { placeWizardSteps } from '@drizztdourden08/brock-react';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { STEP_IDS, stepLabels } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues, StepContext } from '../ProfileCreateWizard.type';
import { profileProblem } from './profile-problem';
import { profileSummary } from './profile-summary';

const busyHintOf = (joining: number | null, t: I18n['t']): string =>
  (joining === null ? t('wizards:profile.busy.creating') : t('wizards:profile.busy.joining', { percent: Math.round(joining * 100) }));

const profileWizardSteps = ({ joining, modules, t }: StepContext): readonly WizardStepDef<ProfileWizardValues>[] =>
  placeWizardSteps<ProfileWizardValues>(
    [
      {
        id: STEP_IDS.profile,
        label: stepLabels(t).profile,
        validate: (values) => profileProblem(values, t),
        summary: profileSummary,
      },
      {
        id: STEP_IDS.review,
        label: stepLabels(t).review,
        buttons: { next: { label: t('wizards:profile.buttons.create') } },
        busyHint: () => busyHintOf(joining, t),
      },
    ],
    modules,
  );

export { profileWizardSteps };
