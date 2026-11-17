/* @layer renderer-components @kind logic */
import { ROM_KINDS } from '@rotp/roms';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { BUSY_HINT, IMPORT_BUTTONS, STEP_IDS, STEP_LABELS } from '../RomCreateWizard.constants';
import type { RomWizardValues } from '../RomCreateWizard.type';
import { stepBuilder } from '../../../wizard-step';
import { fileProblem } from './file-problem';

const step = stepBuilder<RomWizardValues, keyof typeof STEP_IDS>(STEP_IDS, STEP_LABELS);

const romWizardSteps: readonly WizardStepDef<RomWizardValues>[] = [
  step('kind', { summary: (values) => ROM_KINDS[values.kind].label }),
  step('file', { validate: fileProblem, summary: (values) => values.file?.name ?? values.url.trim() }),
  step('import', { busyHint: BUSY_HINT, buttons: IMPORT_BUTTONS }),
];

export { romWizardSteps };
