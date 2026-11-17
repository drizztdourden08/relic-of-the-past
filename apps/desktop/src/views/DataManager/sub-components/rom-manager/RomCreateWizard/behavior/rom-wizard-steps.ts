/* @layer renderer-components @kind logic */
import { ROM_KINDS } from '@rotp/roms';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { BUSY_HINT, IMPORT_BUTTONS, STEP_IDS, STEP_LABELS } from '../RomCreateWizard.constants';
import type { RomWizardValues } from '../RomCreateWizard.type';
import { fileProblem } from './file-problem';

const ROM_WIZARD_STEPS: readonly WizardStepDef<RomWizardValues>[] = [
  {
    id: STEP_IDS.kind,
    label: STEP_LABELS.kind,
    summary: (values) => ROM_KINDS[values.kind].label,
  },
  {
    id: STEP_IDS.file,
    label: STEP_LABELS.file,
    validate: fileProblem,
    summary: (values) => values.file?.name ?? values.url.trim(),
  },
  {
    id: STEP_IDS.import,
    label: STEP_LABELS.import,
    busyHint: BUSY_HINT,
    buttons: IMPORT_BUTTONS,
  },
];

export { ROM_WIZARD_STEPS };
