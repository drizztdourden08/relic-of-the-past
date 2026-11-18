/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { STEP_IDS } from '../SpriteCreateWizard.constants';
import type { SpriteWizardValues } from '../SpriteCreateWizard.type';

const spriteWizardSteps = (t: I18n['t']): readonly WizardStepDef<SpriteWizardValues>[] => [
  {
    id: STEP_IDS.rom,
    label: t('wizards:sprite.steps.rom'),
    validate: (values) => (values.romFile === '' ? t('wizards:sprite.problem.no-rom') : null),
    summary: (values) => values.romFile,
  },
  {
    id: STEP_IDS.extract,
    label: t('wizards:sprite.steps.extract'),
    busyHint: t('wizards:sprite.busy'),
    buttons: { next: { label: t('wizards:sprite.buttons.extract') } },
  },
];

export { spriteWizardSteps };
