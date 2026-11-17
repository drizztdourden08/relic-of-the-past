/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import {
  BUSY_HINT, CREATE_BUTTONS, IMPORT_BUTTONS, NEEDS_ROM, NOT_IMPORTED, SOURCE_LABELS, STEP_IDS, STEP_LABELS,
} from '../CharacterCreateWizard.constants';
import type { CharacterSource, CharacterWizardValues, StepContext } from '../CharacterCreateWizard.type';

const sourceIs = (source: CharacterSource) => (values: CharacterWizardValues): boolean => values.source === source;

const characterWizardSteps = (context: StepContext): readonly WizardStepDef<CharacterWizardValues>[] => [
  {
    id: STEP_IDS.source,
    label: STEP_LABELS.source,
    validate: (values) => (values.source === 'blank' && !context.canCreate ? NEEDS_ROM : null),
    summary: (values) => SOURCE_LABELS[values.source],
  },
  {
    id: STEP_IDS.create,
    label: STEP_LABELS.create,
    when: sourceIs('blank'),
    busyHint: BUSY_HINT,
    buttons: CREATE_BUTTONS,
  },
  {
    id: STEP_IDS.import,
    label: STEP_LABELS.import,
    when: sourceIs('import'),
    validate: () => (context.imported === null ? NOT_IMPORTED : null),
    buttons: IMPORT_BUTTONS,
  },
];

export { characterWizardSteps };
