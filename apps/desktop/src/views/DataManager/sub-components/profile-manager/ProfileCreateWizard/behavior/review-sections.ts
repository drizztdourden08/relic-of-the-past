/* @layer renderer-components @kind logic */
import { OPTIONS_STEP_ID, RANDOMIZER_STEP_ID, connectionStep } from '@drizztdourden08/brock-randomizer/renderer';
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import { ROTP_LOBBY_STEP_ID } from '@app/randomizer/lobby/rotp-lobby.constants';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import { STEP_IDS, STEP_LABELS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { connectionRows } from './connection-rows';
import { optionRows } from './option-rows';
import { profileRows } from './profile-rows';
import { randomizerRows } from './randomizer-rows';

const connectionSectionOf = (values: ProfileWizardValues): WizardReviewSection[] => {
  const { enabled, mode } = wizardFactsOf(values);
  if (!enabled || mode === 'local') return [];
  const stepId = mode === 'archipelia' ? ROTP_LOBBY_STEP_ID : connectionStep.id;
  return [{ stepId, title: 'Connection', rows: connectionRows(values) }];
};

const reviewSections = (values: ProfileWizardValues): WizardReviewSection[] => [
  { stepId: STEP_IDS.profile, title: STEP_LABELS.profile, rows: profileRows(values) },
  { stepId: RANDOMIZER_STEP_ID, title: 'Randomizer', rows: randomizerRows(values) },
  ...connectionSectionOf(values),
  ...(wizardFactsOf(values).enabled ? [{ stepId: OPTIONS_STEP_ID, title: 'Options', rows: optionRows(values) }] : []),
];

export { reviewSections };
