/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import {
  BUSY_HINTS, CREATE_BUTTONS, EXTRACT_BUTTONS, IMPORTED_BUTTONS, IMPORT_BUTTONS, PROBLEMS, SOURCE_LABELS, STEP_IDS, STEP_LABELS,
} from '../LanguageCreateWizard.constants';
import type { LanguageSource, LanguageWizardValues, StepContext } from '../LanguageCreateWizard.type';
import { detailsProblem } from './details-problem';
import { detailsSummary } from './details-summary';

const sourceIs = (...sources: LanguageSource[]) => (values: LanguageWizardValues): boolean => sources.includes(values.source);

const languageWizardSteps = (context: StepContext): readonly WizardStepDef<LanguageWizardValues>[] => [
  {
    id: STEP_IDS.source,
    label: STEP_LABELS.source,
    summary: (values) => SOURCE_LABELS[values.source],
  },
  {
    id: STEP_IDS.details,
    label: STEP_LABELS.details,
    validate: (values) => detailsProblem(values, context),
    summary: detailsSummary,
  },
  {
    id: STEP_IDS.extract,
    label: STEP_LABELS.extract,
    when: sourceIs('rom'),
    busyHint: BUSY_HINTS.extract,
    buttons: EXTRACT_BUTTONS,
  },
  {
    id: STEP_IDS.import,
    label: STEP_LABELS.import,
    when: sourceIs('patched'),
    validate: () => (context.imported === null ? PROBLEMS.notImported : null),
    busyHint: BUSY_HINTS.import,
    buttons: context.imported === null ? IMPORT_BUTTONS : IMPORTED_BUTTONS,
  },
  {
    id: STEP_IDS.create,
    label: STEP_LABELS.create,
    when: sourceIs('copy', 'blank'),
    busyHint: BUSY_HINTS.create,
    buttons: CREATE_BUTTONS,
  },
];

export { languageWizardSteps };
