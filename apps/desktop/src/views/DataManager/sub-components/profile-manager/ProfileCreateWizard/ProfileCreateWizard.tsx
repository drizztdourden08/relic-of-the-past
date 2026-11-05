/* @layer renderer-views @kind view */
import { Wizard } from '@drizztdourden08/tessera/composites';
import { WIZARD_TITLE } from './ProfileCreateWizard.constants';
import type { ProfileCreateWizardProps } from './ProfileCreateWizard.type';
import { useProfileWizard } from './behavior/useProfileWizard';
import { StepBody } from './sub-components/StepBody';

const ProfileCreateWizard = (props: ProfileCreateWizardProps) => {
  const { readyRoms, languages, msuPacks, onCreateProfile, onCancel, onCreated } = props;
  const { wizard, modules } = useProfileWizard({ onCreateProfile, onCreated });

  return (
    <Wizard wizard={wizard} title={WIZARD_TITLE} orientation="vertical" stepperSize="sm" onExit={onCancel}>
      <StepBody wizard={wizard} modules={modules} readyRoms={readyRoms} languages={languages} msuPacks={msuPacks} />
    </Wizard>
  );
};

export { ProfileCreateWizard };
