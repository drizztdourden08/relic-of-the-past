/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { BUSY_HINT, CREATE_BUTTONS, SOURCE_LABELS, STEP_IDS, STEP_LABELS } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';
import { stepBuilder } from '../../../wizard-step';
import { detailsProblem } from './details-problem';

const step = stepBuilder<MsuWizardValues, keyof typeof STEP_IDS>(STEP_IDS, STEP_LABELS);

const msuWizardSteps = (isTaken: (name: string) => boolean): readonly WizardStepDef<MsuWizardValues>[] => [
  step('source', { summary: (values) => SOURCE_LABELS[values.source] }),
  step('details', { validate: (values) => detailsProblem(values, isTaken), summary: (values) => values.name.trim() }),
  step('create', { busyHint: BUSY_HINT, buttons: CREATE_BUTTONS }),
];

export { msuWizardSteps };
