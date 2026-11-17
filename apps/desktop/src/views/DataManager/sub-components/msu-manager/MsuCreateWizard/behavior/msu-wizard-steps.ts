/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { BUSY_HINT, CREATE_BUTTONS, SOURCE_LABELS, STEP_IDS, STEP_LABELS } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';
import { detailsProblem } from './details-problem';

const msuWizardSteps = (isTaken: (name: string) => boolean): readonly WizardStepDef<MsuWizardValues>[] => [
  {
    id: STEP_IDS.source,
    label: STEP_LABELS.source,
    summary: (values) => SOURCE_LABELS[values.source],
  },
  {
    id: STEP_IDS.details,
    label: STEP_LABELS.details,
    validate: (values) => detailsProblem(values, isTaken),
    summary: (values) => values.name.trim(),
  },
  {
    id: STEP_IDS.create,
    label: STEP_LABELS.create,
    busyHint: BUSY_HINT,
    buttons: CREATE_BUTTONS,
  },
];

export { msuWizardSteps };
