/* @layer renderer-views @kind view */
import { useT } from '@drizztdourden08/brock-react';
import { Wizard } from '@drizztdourden08/tessera/composites';
import type { CharacterCreateWizardProps } from './CharacterCreateWizard.type';
import { useCharacterWizard } from './behavior/useCharacterWizard';
import { StepBody } from './sub-components/StepBody';

const CharacterCreateWizard = (props: CharacterCreateWizardProps) => {
  const t = useT();
  const { onCancel, ...rest } = props;
  const { wizard, imported, importUrl, importFiles } = useCharacterWizard(rest);

  return (
    <Wizard wizard={wizard} busy={wizard.busy} title={t('views-player-sprite-studio:wizard.title')} orientation="vertical" stepperSize="sm" onExit={onCancel}>
      <StepBody wizard={wizard} imported={imported} onUrlImport={importUrl} onFileImport={importFiles} />
    </Wizard>
  );
};

export { CharacterCreateWizard };
