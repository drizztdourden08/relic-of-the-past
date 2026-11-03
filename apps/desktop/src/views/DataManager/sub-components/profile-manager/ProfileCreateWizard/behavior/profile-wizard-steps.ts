/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { CREATING_HINT, FINISH_LABEL, STEP_IDS, STEP_LABELS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues, StepContext } from '../ProfileCreateWizard.type';
import { optionSubSteps } from './option-sub-steps';
import { needsConnection } from './step-conditions';
import { connectionProblem, profileProblem, seedProblem } from './step-problems';
import { connectionSummary, optionsSummary, profileSummary, randomizerSummary } from './step-summaries';

const busyHintOf = (joining: number | null): string =>
  (joining === null ? CREATING_HINT : `Joining the lobby, ${Math.round(joining * 100)}%`);

const profileWizardSteps = ({ experimental, joining }: StepContext): readonly WizardStepDef<ProfileWizardValues>[] => [
  {
    id: STEP_IDS.profile,
    label: STEP_LABELS.profile,
    validate: profileProblem,
    summary: profileSummary,
  },
  {
    id: STEP_IDS.randomizer,
    label: STEP_LABELS.randomizer,
    validate: seedProblem,
    summary: randomizerSummary,
  },
  {
    id: STEP_IDS.connection,
    label: STEP_LABELS.connection,
    when: ({ randomizer }) => needsConnection(randomizer, experimental),
    validate: connectionProblem(experimental),
    summary: connectionSummary,
  },
  {
    id: STEP_IDS.options,
    label: STEP_LABELS.options,
    when: ({ randomizer }) => randomizer.enabled,
    subSteps: optionSubSteps,
    summary: optionsSummary,
  },
  {
    id: STEP_IDS.review,
    label: STEP_LABELS.review,
    buttons: { next: { label: FINISH_LABEL } },
    busyHint: () => busyHintOf(joining),
  },
];

export { profileWizardSteps };
