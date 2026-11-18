/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { ROM_KINDS } from '@rotp/roms';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { importButtons, STEP_IDS, stepLabels } from '../RomCreateWizard.constants';
import type { RomWizardValues } from '../RomCreateWizard.type';
import { stepBuilder } from '../../../wizard-step';
import { fileProblem } from './file-problem';

const romWizardSteps = (t: I18n['t']): readonly WizardStepDef<RomWizardValues>[] => {
  const step = stepBuilder<RomWizardValues, keyof typeof STEP_IDS>(STEP_IDS, stepLabels(t));
  return [
  step('kind', { summary: (values) => ROM_KINDS[values.kind].label }),
  step('file', { validate: (values) => fileProblem(values, t), summary: (values) => values.file?.name ?? values.url.trim() }),
  step('import', { busyHint: t('wizards:rom.busy'), buttons: importButtons(t) }),
  ];
};

export { romWizardSteps };
