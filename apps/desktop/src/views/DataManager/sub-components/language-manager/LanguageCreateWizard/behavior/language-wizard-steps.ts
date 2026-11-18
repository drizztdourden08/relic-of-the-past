/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import {
  busyHints, createButtons, extractButtons, importedButtons, importButtons, problems, sourceLabels, STEP_IDS, stepLabels,
} from '../LanguageCreateWizard.constants';
import type { LanguageSource, LanguageWizardValues, StepContext } from '../LanguageCreateWizard.type';
import { stepBuilder } from '../../../wizard-step';
import { detailsProblem } from './details-problem';
import { detailsSummary } from './details-summary';

const sourceIs = (...sources: LanguageSource[]) => (values: LanguageWizardValues): boolean => sources.includes(values.source);

const languageWizardSteps = (context: StepContext, t: I18n['t']): readonly WizardStepDef<LanguageWizardValues>[] => {
  const step = stepBuilder<LanguageWizardValues, keyof typeof STEP_IDS>(STEP_IDS, stepLabels(t));
  const hints = busyHints(t);
  const issues = problems(t);
  return [
  step('source', { summary: (values) => sourceLabels(t)[values.source] }),
  step('details', { validate: (values) => detailsProblem(values, context, t), summary: detailsSummary }),
  step('extract', { when: sourceIs('rom'), busyHint: hints.extract, buttons: extractButtons(t) }),
  step('import', {
    when: sourceIs('patched'),
    validate: () => (context.imported === null ? issues.notImported : null),
    busyHint: hints.import,
    buttons: context.imported === null ? importButtons(t) : importedButtons(t),
  }),
  step('create', { when: sourceIs('copy', 'blank'), busyHint: hints.create, buttons: createButtons(t) }),
  ];
};

export { languageWizardSteps };
