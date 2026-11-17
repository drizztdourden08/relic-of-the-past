/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { BUSY_HINT, EXTRACT_BUTTONS, NO_ROM_PROBLEM, STEP_IDS, STEP_LABELS } from '../SpriteCreateWizard.constants';
import type { SpriteWizardValues } from '../SpriteCreateWizard.type';

const spriteWizardSteps: readonly WizardStepDef<SpriteWizardValues>[] = [
  {
    id: STEP_IDS.rom,
    label: STEP_LABELS.rom,
    validate: (values) => (values.romFile === '' ? NO_ROM_PROBLEM : null),
    summary: (values) => values.romFile,
  },
  {
    id: STEP_IDS.extract,
    label: STEP_LABELS.extract,
    busyHint: BUSY_HINT,
    buttons: EXTRACT_BUTTONS,
  },
];

export { spriteWizardSteps };
