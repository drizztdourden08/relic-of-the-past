/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { createButtons, sourceLabels, STEP_IDS, stepLabels } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';
import { stepBuilder } from '../../../wizard-step';
import { detailsProblem } from './details-problem';

const msuWizardSteps = (isTaken: (name: string) => boolean, t: I18n['t']): readonly WizardStepDef<MsuWizardValues>[] => {
  const step = stepBuilder<MsuWizardValues, keyof typeof STEP_IDS>(STEP_IDS, stepLabels(t));
  return [
  step('source', { summary: (values) => sourceLabels(t)[values.source] }),
  step('details', { validate: (values) => detailsProblem(values, isTaken, t), summary: (values) => values.name.trim() }),
  step('create', { busyHint: t('wizards:msu.busy'), buttons: createButtons(t) }),
  ];
};

export { msuWizardSteps };
