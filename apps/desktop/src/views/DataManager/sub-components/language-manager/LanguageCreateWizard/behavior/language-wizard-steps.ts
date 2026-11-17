/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import {
  BUSY_HINTS, CREATE_BUTTONS, EXTRACT_BUTTONS, IMPORTED_BUTTONS, IMPORT_BUTTONS, PROBLEMS, SOURCE_LABELS, STEP_IDS, STEP_LABELS,
} from '../LanguageCreateWizard.constants';
import type { LanguageSource, LanguageWizardValues, StepContext } from '../LanguageCreateWizard.type';
import { stepBuilder } from '../../../wizard-step';
import { detailsProblem } from './details-problem';
import { detailsSummary } from './details-summary';

const sourceIs = (...sources: LanguageSource[]) => (values: LanguageWizardValues): boolean => sources.includes(values.source);

const step = stepBuilder<LanguageWizardValues, keyof typeof STEP_IDS>(STEP_IDS, STEP_LABELS);

const languageWizardSteps = (context: StepContext): readonly WizardStepDef<LanguageWizardValues>[] => [
  step('source', { summary: (values) => SOURCE_LABELS[values.source] }),
  step('details', { validate: (values) => detailsProblem(values, context), summary: detailsSummary }),
  step('extract', { when: sourceIs('rom'), busyHint: BUSY_HINTS.extract, buttons: EXTRACT_BUTTONS }),
  step('import', {
    when: sourceIs('patched'),
    validate: () => (context.imported === null ? PROBLEMS.notImported : null),
    busyHint: BUSY_HINTS.import,
    buttons: context.imported === null ? IMPORT_BUTTONS : IMPORTED_BUTTONS,
  }),
  step('create', { when: sourceIs('copy', 'blank'), busyHint: BUSY_HINTS.create, buttons: CREATE_BUTTONS }),
];

export { languageWizardSteps };
