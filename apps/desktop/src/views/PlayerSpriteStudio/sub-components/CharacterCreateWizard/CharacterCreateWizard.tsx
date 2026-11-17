/* @layer renderer-views @kind view */
import { Wizard } from '@drizztdourden08/tessera/composites';
import { WIZARD_TITLE } from './CharacterCreateWizard.constants';
import type { CharacterCreateWizardProps } from './CharacterCreateWizard.type';
import { useCharacterWizard } from './behavior/useCharacterWizard';
import { StepBody } from './sub-components/StepBody';

const CharacterCreateWizard = (props: CharacterCreateWizardProps) => {
  const { onCancel, ...rest } = props;
  const { wizard, imported, importUrl, importFiles } = useCharacterWizard(rest);

  return (
    <Wizard wizard={wizard} busy={wizard.busy} title={WIZARD_TITLE} orientation="vertical" stepperSize="sm" onExit={onCancel}>
      <StepBody wizard={wizard} imported={imported} onUrlImport={importUrl} onFileImport={importFiles} />
    </Wizard>
  );
};

export { CharacterCreateWizard };
