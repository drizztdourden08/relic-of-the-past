/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import { STEP_IDS } from '../CharacterCreateWizard.constants';
import type { CharacterSource, CharacterWizardValues, StepContext } from '../CharacterCreateWizard.type';

const sourceIs = (source: CharacterSource) => (values: CharacterWizardValues): boolean => values.source === source;

const characterWizardSteps = (context: StepContext): readonly WizardStepDef<CharacterWizardValues>[] => {
  const { t } = context;
  return [
    {
      id: STEP_IDS.source,
      label: t('views-player-sprite-studio:wizard.step.source'),
      validate: (values) => (values.source === 'blank' && !context.canCreate ? t('views-player-sprite-studio:wizard.needsRom') : null),
      summary: (values) => t(`views-player-sprite-studio:wizard.source.${values.source}.label`),
    },
    {
      id: STEP_IDS.create,
      label: t('views-player-sprite-studio:wizard.step.create'),
      when: sourceIs('blank'),
      busyHint: t('views-player-sprite-studio:wizard.busy'),
      buttons: { next: { label: t('views-player-sprite-studio:wizard.createButton') } },
    },
    {
      id: STEP_IDS.import,
      label: t('views-player-sprite-studio:wizard.step.import'),
      when: sourceIs('import'),
      validate: () => (context.imported === null ? t('views-player-sprite-studio:wizard.notImported') : null),
      buttons: { next: { label: t('views-player-sprite-studio:wizard.doneButton') } },
    },
  ];
};

export { characterWizardSteps };
